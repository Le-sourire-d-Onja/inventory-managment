import { beforeEach, describe, expect, it } from "vitest";
import { PATCH as patchDemand, POST as postDemand } from "@/app/api/demands/route";
import { PATCH as patchContainer } from "@/app/api/containers/route";
import { prisma } from "@/app/api/prisma";
import { PackagingType } from "@/lib/generated/prisma";
import {
  createContainer,
  createDemand,
  createDonationWithArticle,
  resetDatabase,
  seed,
} from "./helpers/db";
import { demandBody, jsonRequest, stockQuantityOf } from "./helpers/http";

async function demandContainersOf(demandId: string) {
  const demand = await prisma.demand.findUniqueOrThrow({
    where: { id: demandId },
    include: { containers: { include: { contents: true } } },
  });
  return demand.containers.map((container) => ({
    id: container.id,
    packaging: container.packaging,
    contents: container.contents.map((content) => ({
      type_id: content.type_id,
      quantity: content.quantity,
    })),
  }));
}

describe("attributing a container never checks availability", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("attributes a demand that exceeds available stock without refusing", async () => {
    const { articleType, association } = await seed();
    await createDonationWithArticle(articleType.id, 100);

    const response = await postDemand(
      jsonRequest("http://localhost/api/demands", "POST", demandBody(association.id, [{ type_id: articleType.id, quantity: 150 }])),
    );

    expect(response.status).toBe(200);
    expect(await stockQuantityOf(articleType.id)).toBe(-50);
  });

  it("accepts a demand within available stock and decrements stock", async () => {
    const { articleType, association } = await seed();
    await createDonationWithArticle(articleType.id, 100);

    const response = await postDemand(
      jsonRequest("http://localhost/api/demands", "POST", demandBody(association.id, [{ type_id: articleType.id, quantity: 60 }])),
    );

    expect(response.status).toBe(200);
    expect(await stockQuantityOf(articleType.id)).toBe(40);
  });

  it("attributes a second demand that exceeds the remaining stock without refusing", async () => {
    const { articleType, association } = await seed();
    await createDonationWithArticle(articleType.id, 100);

    const first = await postDemand(
      jsonRequest("http://localhost/api/demands", "POST", demandBody(association.id, [{ type_id: articleType.id, quantity: 60 }])),
    );
    expect(first.status).toBe(200);

    const second = await postDemand(
      jsonRequest("http://localhost/api/demands", "POST", demandBody(association.id, [{ type_id: articleType.id, quantity: 50 }])),
    );

    expect(second.status).toBe(200);
    expect(await stockQuantityOf(articleType.id)).toBe(-10);
  });

  it("attributes a free container beyond available stock without refusing", async () => {
    const { articleType, association } = await seed();
    await createDonationWithArticle(articleType.id, 100);
    const demand = await createDemand(association.id);
    const free = await createContainer({
      packaging: PackagingType.CARDBOARD,
      contents: { create: [{ type_id: articleType.id, quantity: 150 }] },
    });

    const response = await patchContainer(
      jsonRequest("http://localhost/api/containers", "PATCH", {
        id: free.id,
        packaging: PackagingType.CARDBOARD,
        demand_id: demand.id,
        contents: [{ type_id: articleType.id, quantity: 150 }],
      }),
    );

    expect(response.status).toBe(200);
    expect(await stockQuantityOf(articleType.id)).toBe(-50);
  });

  it("re-attributes a container beyond available stock without refusing", async () => {
    const { articleType, association } = await seed();
    await createDonationWithArticle(articleType.id, 100);
    const created = await postDemand(
      jsonRequest("http://localhost/api/demands", "POST", demandBody(association.id, [{ type_id: articleType.id, quantity: 80 }])),
    );
    const demand = await created.json();
    const [container] = await demandContainersOf(demand.id);

    const tooBig = await patchContainer(
      jsonRequest("http://localhost/api/containers", "PATCH", {
        id: container.id,
        packaging: PackagingType.CARDBOARD,
        demand_id: demand.id,
        contents: [{ type_id: articleType.id, quantity: 150 }],
      }),
    );
    expect(tooBig.status).toBe(200);

    const fits = await patchContainer(
      jsonRequest("http://localhost/api/containers", "PATCH", {
        id: container.id,
        packaging: PackagingType.CARDBOARD,
        demand_id: demand.id,
        contents: [{ type_id: articleType.id, quantity: 100 }],
      }),
    );
    expect(fits.status).toBe(200);
    expect(await stockQuantityOf(articleType.id)).toBe(0);
  });
});

describe("legacy over-allocation: a demand holds more than was donated", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  async function overAllocatedDemand() {
    const { articleType, association } = await seed();
    await createDonationWithArticle(articleType.id, 1);
    const demand = await createDemand(association.id);
    await createContainer({
      packaging: PackagingType.CARDBOARD,
      demand: { connect: { id: demand.id } },
      contents: { create: [{ type_id: articleType.id, quantity: 12 }] },
    });
    return { articleType, association, demand };
  }

  it("allows adding a container even though the demand already over-allocated a type", async () => {
    const { association, demand } = await overAllocatedDemand();
    const existing = await demandContainersOf(demand.id);

    const response = await patchDemand(
      jsonRequest("http://localhost/api/demands", "PATCH", {
        id: demand.id,
        association_id: association.id,
        containers: [...existing, { packaging: PackagingType.CARDBOARD, contents: [] }],
        linkedContainers: [],
      }),
    );

    expect(response.status).toBe(200);
    expect(await prisma.container.count({ where: { demand_id: demand.id } })).toBe(2);
  });

  it("allows increasing an over-allocated type", async () => {
    const { articleType, association, demand } = await overAllocatedDemand();
    const existing = await demandContainersOf(demand.id);

    const response = await patchDemand(
      jsonRequest("http://localhost/api/demands", "PATCH", {
        id: demand.id,
        association_id: association.id,
        containers: [
          ...existing,
          { packaging: PackagingType.CARDBOARD, contents: [{ type_id: articleType.id, quantity: 1 }] },
        ],
        linkedContainers: [],
      }),
    );

    expect(response.status).toBe(200);
    expect(await prisma.container.count({ where: { demand_id: demand.id } })).toBe(2);
  });
});

import { beforeEach, describe, expect, it } from "vitest";
import { PATCH as patchDemand, POST as postDemand } from "@/app/api/demands/route";
import { PATCH as patchContainer } from "@/app/api/containers/route";
import { prisma } from "@/app/api/prisma";
import { DemandStatus, PackagingType } from "@/lib/generated/prisma";
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

describe("availability enforced at attribution", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("refuses a demand whose contents exceed available stock", async () => {
    const { articleType, association } = await seed();
    await createDonationWithArticle(articleType.id, 100);

    const response = await postDemand(
      jsonRequest("http://localhost/api/demands", "POST", demandBody(association.id, [{ type_id: articleType.id, quantity: 150 }])),
    );

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
    expect(await stockQuantityOf(articleType.id)).toBe(100);
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

  it("refuses a second demand that exceeds the remaining stock", async () => {
    const { articleType, association } = await seed();
    await createDonationWithArticle(articleType.id, 100);

    const first = await postDemand(
      jsonRequest("http://localhost/api/demands", "POST", demandBody(association.id, [{ type_id: articleType.id, quantity: 60 }])),
    );
    expect(first.status).toBe(200);

    const second = await postDemand(
      jsonRequest("http://localhost/api/demands", "POST", demandBody(association.id, [{ type_id: articleType.id, quantity: 50 }])),
    );

    expect(second.status).toBeGreaterThanOrEqual(400);
    expect(second.status).toBeLessThan(500);
    expect(await stockQuantityOf(articleType.id)).toBe(40);
  });

  it("refuses attributing a free container beyond available stock", async () => {
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

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
    expect(await stockQuantityOf(articleType.id)).toBe(100);
  });

  it("re-checks availability on re-attribution of the same demand", async () => {
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
    expect(tooBig.status).toBeGreaterThanOrEqual(400);
    expect(tooBig.status).toBeLessThan(500);

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

describe("validation recalibrated around the demand's own consumption", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("validates a demand whose needs equal its own attributed consumption", async () => {
    const { articleType, association } = await seed();
    await createDonationWithArticle(articleType.id, 100);
    const created = await postDemand(
      jsonRequest("http://localhost/api/demands", "POST", demandBody(association.id, [{ type_id: articleType.id, quantity: 100 }])),
    );
    const demand = await created.json();
    expect(await stockQuantityOf(articleType.id)).toBe(0);

    const response = await patchDemand(
      jsonRequest("http://localhost/api/demands", "PATCH", {
        id: demand.id,
        status: DemandStatus.VALIDATED,
        association_id: association.id,
        containers: await demandContainersOf(demand.id),
      }),
    );

    expect(response.status).toBe(200);
  });

  it("refuses validation when another demand over-allocated the stock", async () => {
    const { articleType, association } = await seed();
    await createDonationWithArticle(articleType.id, 100);
    const created = await postDemand(
      jsonRequest("http://localhost/api/demands", "POST", demandBody(association.id, [{ type_id: articleType.id, quantity: 50 }])),
    );
    const demand = await created.json();

    const concurrent = await createDemand(association.id);
    await createContainer({
      packaging: PackagingType.CARDBOARD,
      demand: { connect: { id: concurrent.id } },
      contents: { create: [{ type_id: articleType.id, quantity: 130 }] },
    });

    const response = await patchDemand(
      jsonRequest("http://localhost/api/demands", "PATCH", {
        id: demand.id,
        status: DemandStatus.VALIDATED,
        association_id: association.id,
        containers: await demandContainersOf(demand.id),
      }),
    );

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
  });
});

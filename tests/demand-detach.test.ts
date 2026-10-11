import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";
import {
  DELETE as deleteDemand,
  PATCH as patchDemand,
  POST as postDemand,
} from "@/app/api/demands/route";
import { GET as getContainer, PATCH as patchContainer } from "@/app/api/containers/route";
import { prisma } from "@/app/api/prisma";
import { PackagingType } from "@/lib/generated/prisma";
import { createContainer, createDonationWithArticle, resetDatabase, seed } from "./helpers/db";
import { demandBody, jsonRequest, stockQuantityOf } from "./helpers/http";

async function containerStateOf(id: string): Promise<string> {
  const response = await getContainer(new NextRequest(`http://localhost/api/containers?id=${id}`));
  const body = await response.json();
  return body.state.text;
}

type DemandContainer = {
  id: string;
  packaging: PackagingType;
  contents: { id: string; quantity: number; type: { id: string } }[];
};

function withQuantity(demand: { containers: DemandContainer[] }, quantity: number): DemandContainer {
  const container = demand.containers.find((c) => c.contents[0]?.quantity === quantity);
  if (!container) throw new Error(`No container with quantity ${quantity}`);
  return container;
}

describe("PATCH /api/demands — detaching containers", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("detaches a removed container: keeps the row and contents, back to En attente, dates cleared, stock restored", async () => {
    const { articleType, association } = await seed();
    await createDonationWithArticle(articleType.id, 200);
    const created = await postDemand(
      jsonRequest("http://localhost/api/demands", "POST", demandBody(association.id, [
        { type_id: articleType.id, quantity: 60 },
      ])),
    );
    const demand = await created.json();
    const container = withQuantity(demand, 60);
    expect(await stockQuantityOf(articleType.id)).toBe(140);

    const response = await patchDemand(
      jsonRequest("http://localhost/api/demands", "PATCH", {
        id: demand.id,
        association_id: association.id,
        containers: [],
        linkedContainers: [],
      }),
    );

    expect(response.status).toBe(200);

    const stored = await prisma.container.findUnique({
      where: { id: container.id },
      include: { contents: true },
    });
    expect(stored).not.toBeNull();
    expect(stored?.demand_id).toBeNull();
    expect(stored?.containerized_at).toBeNull();
    expect(stored?.distributed_at).toBeNull();
    expect(stored?.contents).toHaveLength(1);
    expect(stored?.contents[0].quantity).toBe(60);

    expect(await stockQuantityOf(articleType.id)).toBe(200);
    expect(await containerStateOf(container.id)).toBe("En attente");
  });

  it("refuses to detach an Empoté container", async () => {
    const { articleType, association } = await seed();
    await createDonationWithArticle(articleType.id, 200);
    const created = await postDemand(
      jsonRequest("http://localhost/api/demands", "POST", demandBody(association.id, [
        { type_id: articleType.id, quantity: 60 },
      ])),
    );
    const demand = await created.json();
    const container = withQuantity(demand, 60);
    await patchContainer(
      jsonRequest("http://localhost/api/containers", "PATCH", {
        id: container.id,
        action: "containerize",
      }),
    );

    const response = await patchDemand(
      jsonRequest("http://localhost/api/demands", "PATCH", {
        id: demand.id,
        association_id: association.id,
        containers: [],
        linkedContainers: [],
      }),
    );

    expect(response.status).toBe(409);
    const stored = await prisma.container.findUnique({ where: { id: container.id } });
    expect(stored?.demand_id).toBe(demand.id);
    expect(stored?.containerized_at).not.toBeNull();
  });

  it("refuses to detach a Distribué container", async () => {
    const { articleType, association } = await seed();
    await createDonationWithArticle(articleType.id, 200);
    const created = await postDemand(
      jsonRequest("http://localhost/api/demands", "POST", demandBody(association.id, [
        { type_id: articleType.id, quantity: 60 },
      ])),
    );
    const demand = await created.json();
    const container = withQuantity(demand, 60);
    await patchContainer(
      jsonRequest("http://localhost/api/containers", "PATCH", {
        id: container.id,
        action: "containerize",
      }),
    );
    await patchContainer(
      jsonRequest("http://localhost/api/containers", "PATCH", {
        id: container.id,
        action: "distribute",
      }),
    );

    const response = await patchDemand(
      jsonRequest("http://localhost/api/demands", "PATCH", {
        id: demand.id,
        association_id: association.id,
        containers: [],
        linkedContainers: [],
      }),
    );

    expect(response.status).toBe(409);
    const stored = await prisma.container.findUnique({ where: { id: container.id } });
    expect(stored?.demand_id).toBe(demand.id);
    expect(stored?.distributed_at).not.toBeNull();
  });

  it("only detaches the container that was removed, keeping the others attached", async () => {
    const { articleType, association } = await seed();
    await createDonationWithArticle(articleType.id, 200);
    const created = await postDemand(
      jsonRequest("http://localhost/api/demands", "POST", demandBody(association.id, [
        { type_id: articleType.id, quantity: 30 },
        { type_id: articleType.id, quantity: 40 },
      ])),
    );
    const demand = await created.json();
    const removed = withQuantity(demand, 30);
    const kept = withQuantity(demand, 40);

    const response = await patchDemand(
      jsonRequest("http://localhost/api/demands", "PATCH", {
        id: demand.id,
        association_id: association.id,
        containers: [
          {
            id: kept.id,
            packaging: kept.packaging,
            contents: kept.contents.map((content) => ({
              id: content.id,
              type_id: content.type.id,
              quantity: content.quantity,
            })),
          },
        ],
        linkedContainers: [],
      }),
    );

    expect(response.status).toBe(200);
    expect(await containerStateOf(kept.id)).toBe("Attribué");
    expect(await containerStateOf(removed.id)).toBe("En attente");
    expect(await stockQuantityOf(articleType.id)).toBe(160);
  });

  it("updates an existing container in place, preserving its identity and content row", async () => {
    const { articleType, association } = await seed();
    await createDonationWithArticle(articleType.id, 200);
    const created = await postDemand(
      jsonRequest("http://localhost/api/demands", "POST", demandBody(association.id, [
        { type_id: articleType.id, quantity: 60 },
      ])),
    );
    const demand = await created.json();
    const container = withQuantity(demand, 60);
    const contentId = container.contents[0].id;

    const response = await patchDemand(
      jsonRequest("http://localhost/api/demands", "PATCH", {
        id: demand.id,
        association_id: association.id,
        containers: [
          {
            id: container.id,
            packaging: PackagingType.FILM,
            contents: [{ id: contentId, type_id: articleType.id, quantity: 70 }],
          },
        ],
        linkedContainers: [],
      }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.containers).toHaveLength(1);
    expect(body.containers[0].id).toBe(container.id);
    expect(body.containers[0].packaging).toBe("FILM");
    expect(body.containers[0].contents).toHaveLength(1);
    expect(body.containers[0].contents[0].id).toBe(contentId);
    expect(body.containers[0].contents[0].quantity).toBe(70);

    const storedContents = await prisma.content.findMany({ where: { container_id: container.id } });
    expect(storedContents).toHaveLength(1);
    expect(storedContents[0].id).toBe(contentId);
    expect(await stockQuantityOf(articleType.id)).toBe(130);
  });

  it("attaches a free container through linkedContainers", async () => {
    const { articleType, association } = await seed();
    await createDonationWithArticle(articleType.id, 100);
    const created = await postDemand(
      jsonRequest("http://localhost/api/demands", "POST", demandBody(association.id, [
        { type_id: articleType.id, quantity: 30 },
      ])),
    );
    const demand = await created.json();
    const own = withQuantity(demand, 30);
    const free = await createContainer({
      packaging: PackagingType.CARDBOARD,
      contents: { create: [{ type_id: articleType.id, quantity: 20 }] },
    });

    const response = await patchDemand(
      jsonRequest("http://localhost/api/demands", "PATCH", {
        id: demand.id,
        association_id: association.id,
        containers: [
          {
            id: own.id,
            packaging: own.packaging,
            contents: own.contents.map((content) => ({
              id: content.id,
              type_id: content.type.id,
              quantity: content.quantity,
            })),
          },
        ],
        linkedContainers: [{ id: free.id }],
      }),
    );

    expect(response.status).toBe(200);
    const stored = await prisma.container.findUnique({ where: { id: free.id } });
    expect(stored?.demand_id).toBe(demand.id);
    expect(await containerStateOf(free.id)).toBe("Attribué");
    expect(await stockQuantityOf(articleType.id)).toBe(50);
  });

  it("rejects an update without a demand id", async () => {
    const { association } = await seed();
    const response = await patchDemand(
      jsonRequest("http://localhost/api/demands", "PATCH", {
        association_id: association.id,
        containers: [],
      }),
    );

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
  });
});

describe("DELETE /api/demands — detaching containers", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("detaches non-Empoté containers and preserves Empoté/Distribué state", async () => {
    const { articleType, association } = await seed();
    await createDonationWithArticle(articleType.id, 200);
    const created = await postDemand(
      jsonRequest("http://localhost/api/demands", "POST", demandBody(association.id, [
        { type_id: articleType.id, quantity: 30 },
        { type_id: articleType.id, quantity: 40 },
      ])),
    );
    const demand = await created.json();
    const distributed = withQuantity(demand, 30);
    const waiting = withQuantity(demand, 40);

    await patchContainer(
      jsonRequest("http://localhost/api/containers", "PATCH", {
        id: distributed.id,
        action: "containerize",
      }),
    );
    await patchContainer(
      jsonRequest("http://localhost/api/containers", "PATCH", {
        id: distributed.id,
        action: "distribute",
      }),
    );

    const response = await deleteDemand(
      new NextRequest(`http://localhost/api/demands?id=${demand.id}`, { method: "DELETE" }),
    );
    expect(response.status).toBe(200);

    const distributedRow = await prisma.container.findUnique({ where: { id: distributed.id } });
    expect(distributedRow?.demand_id).toBeNull();
    expect(distributedRow?.containerized_at).not.toBeNull();
    expect(distributedRow?.distributed_at).not.toBeNull();
    expect(await containerStateOf(distributed.id)).toBe("Distribué");

    const waitingRow = await prisma.container.findUnique({ where: { id: waiting.id } });
    expect(waitingRow?.demand_id).toBeNull();
    expect(waitingRow?.containerized_at).toBeNull();
    expect(waitingRow?.distributed_at).toBeNull();
    expect(await containerStateOf(waiting.id)).toBe("En attente");
  });
});

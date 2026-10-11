import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";
import { GET, PATCH } from "@/app/api/containers/route";
import { prisma } from "@/app/api/prisma";
import { PackagingType } from "@/lib/generated/prisma";
import {
  createContainer,
  createDemand,
  resetDatabase,
  seed,
} from "./helpers/db";

function getContainer(id: string) {
  return GET(new NextRequest(`http://localhost/api/containers?id=${id}`));
}

function patchContainer(body: unknown) {
  return PATCH(
    new NextRequest("http://localhost/api/containers", {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: { "content-type": "application/json" },
    }),
  );
}

describe("Container status derivation and transitions", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("derives En attente for a free container", async () => {
    const { articleType } = await seed();
    await createContainer({
      id: "240001",
      packaging: PackagingType.CARDBOARD,
      contents: { create: [{ type_id: articleType.id, quantity: 1 }] },
    });

    const response = await getContainer("240001");
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.state.text).toBe("En attente");
  });

  it("derives Attribué for a container linked to a demand", async () => {
    const { articleType, association } = await seed();
    const demand = await createDemand(association.id);
    await createContainer({
      id: "240002",
      packaging: PackagingType.CARDBOARD,
      demand: { connect: { id: demand.id } },
      contents: { create: [{ type_id: articleType.id, quantity: 1 }] },
    });

    const response = await getContainer("240002");
    const body = await response.json();

    expect(body.state.text).toBe("Attribué");
  });

  it("derives Empoté (not Empotée) when containerized_at is set", async () => {
    const { articleType, association } = await seed();
    const demand = await createDemand(association.id);
    await createContainer({
      id: "240003",
      packaging: PackagingType.CARDBOARD,
      demand: { connect: { id: demand.id } },
      containerized_at: new Date(),
      contents: { create: [{ type_id: articleType.id, quantity: 1 }] },
    });

    const response = await getContainer("240003");
    const body = await response.json();

    expect(body.state.text).toBe("Empoté");
  });

  it("derives Distribué when distributed_at is set (precedence over Empoté)", async () => {
    const { articleType, association } = await seed();
    const demand = await createDemand(association.id);
    await createContainer({
      id: "240004",
      packaging: PackagingType.CARDBOARD,
      demand: { connect: { id: demand.id } },
      containerized_at: new Date(),
      distributed_at: new Date(),
      contents: { create: [{ type_id: articleType.id, quantity: 1 }] },
    });

    const response = await getContainer("240004");
    const body = await response.json();

    expect(body.state.text).toBe("Distribué");
  });

  it("containerizes then distributes, stamping dates server-side", async () => {
    const { articleType, association } = await seed();
    const demand = await createDemand(association.id);
    await createContainer({
      id: "240005",
      packaging: PackagingType.CARDBOARD,
      demand: { connect: { id: demand.id } },
      contents: { create: [{ type_id: articleType.id, quantity: 1 }] },
    });
    const before = Date.now();

    const containerized = await patchContainer({
      id: "240005",
      action: "containerize",
    });
    const containerizedBody = await containerized.json();

    expect(containerized.status).toBe(200);
    expect(containerizedBody.containerized_at).toBeTruthy();
    expect(containerizedBody.distributed_at).toBeNull();
    expect(containerizedBody.state.text).toBe("Empoté");
    expect(new Date(containerizedBody.containerized_at).getTime()).toBeGreaterThanOrEqual(before);

    const distributed = await patchContainer({
      id: "240005",
      action: "distribute",
    });
    const distributedBody = await distributed.json();

    expect(distributed.status).toBe(200);
    expect(distributedBody.containerized_at).toBeTruthy();
    expect(distributedBody.distributed_at).toBeTruthy();
    expect(distributedBody.state.text).toBe("Distribué");
  });

  it("refuses to containerize a free (En attente) container", async () => {
    await seed();
    await createContainer({ id: "240006", packaging: PackagingType.CARDBOARD });

    const response = await patchContainer({
      id: "240006",
      action: "containerize",
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);

    const container = await prisma.container.findUnique({ where: { id: "240006" } });
    expect(container?.containerized_at).toBeNull();
  });

  it("refuses to containerize an already Empoté container", async () => {
    const { association } = await seed();
    const demand = await createDemand(association.id);
    await createContainer({
      id: "240007",
      packaging: PackagingType.CARDBOARD,
      demand: { connect: { id: demand.id } },
      containerized_at: new Date("2026-01-01T00:00:00.000Z"),
    });

    const response = await patchContainer({
      id: "240007",
      action: "containerize",
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);

    const container = await prisma.container.findUnique({ where: { id: "240007" } });
    expect(container?.containerized_at?.toISOString()).toBe("2026-01-01T00:00:00.000Z");
  });

  it("refuses to distribute a non-Empoté container", async () => {
    const { association } = await seed();
    const demand = await createDemand(association.id);
    await createContainer({
      id: "240008",
      packaging: PackagingType.CARDBOARD,
      demand: { connect: { id: demand.id } },
    });

    const response = await patchContainer({
      id: "240008",
      action: "distribute",
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
  });

  it("refuses any backward transition (Distribué cannot be re-containerized)", async () => {
    const { association } = await seed();
    const demand = await createDemand(association.id);
    await createContainer({
      id: "240009",
      packaging: PackagingType.CARDBOARD,
      demand: { connect: { id: demand.id } },
      containerized_at: new Date(),
      distributed_at: new Date(),
    });

    const response = await patchContainer({
      id: "240009",
      action: "containerize",
    });

    expect(response.status).toBeGreaterThanOrEqual(400);
    expect(response.status).toBeLessThan(500);
  });

  it("allows containerizing while the demand is still IN_PROGRESS", async () => {
    const { association } = await seed();
    const demand = await createDemand(association.id);
    expect(demand.status).toBe("IN_PROGRESS");
    await createContainer({
      id: "240010",
      packaging: PackagingType.CARDBOARD,
      demand: { connect: { id: demand.id } },
    });

    const response = await patchContainer({
      id: "240010",
      action: "containerize",
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.state.text).toBe("Empoté");
  });

  it("still accepts a normal container update (packaging/contents/demand_id)", async () => {
    const { articleType, association } = await seed();
    const demand = await createDemand(association.id);
    await createContainer({ id: "240011", packaging: PackagingType.CARDBOARD });

    const response = await patchContainer({
      id: "240011",
      packaging: PackagingType.FILM,
      demand_id: demand.id,
      contents: [{ type_id: articleType.id, quantity: 3 }],
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.packaging).toBe("FILM");
    expect(body.state.text).toBe("Attribué");
    expect(body.contents).toHaveLength(1);
  });
});

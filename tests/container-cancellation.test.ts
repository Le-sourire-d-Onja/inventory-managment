import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";
import { GET as getContainer, PATCH as patchContainer } from "@/app/api/containers/route";
import { GET as getDemand } from "@/app/api/demands/route";
import { PackagingType } from "@/lib/generated/prisma";
import {
  createContainer,
  createDemand,
  createDonationWithArticle,
  resetDatabase,
  seed,
} from "./helpers/db";
import { PATCH as patchDemand, POST as postDemand } from "@/app/api/demands/route";
import { jsonRequest, stockQuantityOf } from "./helpers/http";

const CONTAINERS_URL = "http://localhost/api/containers";
const DEMANDS_URL = "http://localhost/api/demands";

const CONTAINERIZED_AT = new Date("2026-03-04T10:30:00.000Z");
const DISTRIBUTED_AT = new Date("2026-03-05T15:45:00.000Z");

function transition(id: string, action: string) {
  return patchContainer(jsonRequest(CONTAINERS_URL, "PATCH", { id, action }));
}

async function containerOf(id: string) {
  const response = await getContainer(new NextRequest(`${CONTAINERS_URL}?id=${id}`));
  return response.json();
}

async function demandOf(id: string) {
  const response = await getDemand(new NextRequest(`${DEMANDS_URL}?id=${id}`));
  return response.json();
}

/** Seeds an Association and an attributed container linked to a fresh Demand. */
async function attributedContainer(quantity = 4) {
  const { articleType, association } = await seed();
  await createDonationWithArticle(articleType.id, 100);
  const demand = await createDemand(association.id);
  const container = await createContainer({
    id: "240101",
    packaging: PackagingType.CARDBOARD,
    weight: 4,
    volume: 4,
    value: 10,
    demand: { connect: { id: demand.id } },
    contents: { create: [{ type_id: articleType.id, quantity }] },
  });
  return { container, demand, articleType, association };
}

describe("Annulation d'un empotage ou d'une distribution", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("annule une distribution : efface distributed_at, conserve containerized_at et les Contenus", async () => {
    const { container, demand, articleType } = await attributedContainer(4);

    // Reach Distribué through the API so the dates are stamped server-side.
    expect((await transition(container.id, "containerize")).status).toBe(200);
    expect((await transition(container.id, "distribute")).status).toBe(200);

    const before = await containerOf(container.id);
    const stockBefore = await stockQuantityOf(articleType.id);

    const response = await transition(container.id, "undistribute");

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.distributed_at).toBeNull();
    expect(body.containerized_at).not.toBeNull();
    expect(body.state.text).toBe("Empoté");
    expect(body.demand_id).toBe(demand.id);
    expect(body.contents).toHaveLength(before.contents.length);
    expect(body.contents[0].quantity).toBe(4);
    expect(body.packaging).toBe(PackagingType.CARDBOARD);
    expect(body.weight).toBe(before.weight);
    expect(await stockQuantityOf(articleType.id)).toBe(stockBefore);
  });

  it("annule un empotage : efface containerized_at et laisse le Contenant Attribué", async () => {
    const { container, demand, articleType } = await attributedContainer(4);

    const containerized = await transition(container.id, "containerize");
    const bodyBefore = await containerized.json();
    expect(bodyBefore.containerized_at).toBeTruthy();
    const stockBefore = await stockQuantityOf(articleType.id);

    const response = await transition(container.id, "uncontainerize");

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.containerized_at).toBeNull();
    expect(body.distributed_at).toBeNull();
    expect(body.state.text).toBe("Attribué");
    expect(body.demand_id).toBe(demand.id);
    expect(body.contents).toHaveLength(1);
    expect(body.contents[0].quantity).toBe(4);
    expect(body.weight).toBeCloseTo(4);
    expect(await stockQuantityOf(articleType.id)).toBe(stockBefore);
  });

  it("annule un Contenant daté sans Demande : Distribué → Empoté → En attente", async () => {
    const { articleType } = await seed();
    await createContainer({
      id: "240102",
      packaging: PackagingType.CARDBOARD,
      containerized_at: CONTAINERIZED_AT,
      distributed_at: DISTRIBUTED_AT,
      contents: { create: [{ type_id: articleType.id, quantity: 2 }] },
    });

    const undistributed = await transition("240102", "undistribute");
    const afterUndistribute = await undistributed.json();

    expect(undistributed.status).toBe(200);
    expect(afterUndistribute.distributed_at).toBeNull();
    expect(new Date(afterUndistribute.containerized_at).toISOString()).toBe(
      CONTAINERIZED_AT.toISOString(),
    );
    expect(afterUndistribute.state.text).toBe("Empoté");
    expect(afterUndistribute.demand_id).toBeNull();

    const uncontainerized = await transition("240102", "uncontainerize");
    const afterUncontainerize = await uncontainerized.json();

    expect(uncontainerized.status).toBe(200);
    expect(afterUncontainerize.containerized_at).toBeNull();
    expect(afterUncontainerize.distributed_at).toBeNull();
    expect(afterUncontainerize.state.text).toBe("En attente");
    expect(afterUncontainerize.contents).toHaveLength(1);
  });

  it("refuse toute combinaison illégale en 409 sans effacer de date", async () => {
    const { association } = await seed();
    const demand = await createDemand(association.id);
    await createContainer({ id: "240103", packaging: PackagingType.CARDBOARD });
    await createContainer({
      id: "240104",
      packaging: PackagingType.CARDBOARD,
      demand: { connect: { id: demand.id } },
    });
    await createContainer({
      id: "240105",
      packaging: PackagingType.CARDBOARD,
      demand: { connect: { id: demand.id } },
      containerized_at: CONTAINERIZED_AT,
    });
    await createContainer({
      id: "240106",
      packaging: PackagingType.CARDBOARD,
      demand: { connect: { id: demand.id } },
      containerized_at: CONTAINERIZED_AT,
      distributed_at: DISTRIBUTED_AT,
    });

    const cases: { id: string; action: string }[] = [
      // Annuler un empotage qui n'a pas eu lieu, ou sans avoir annulé la
      // distribution d'abord.
      { id: "240103", action: "uncontainerize" },
      { id: "240104", action: "uncontainerize" },
      { id: "240106", action: "uncontainerize" },
      // Annuler une distribution qui n'a pas eu lieu.
      { id: "240103", action: "undistribute" },
      { id: "240104", action: "undistribute" },
      { id: "240105", action: "undistribute" },
    ];

    for (const invalid of cases) {
      const response = await transition(invalid.id, invalid.action);
      expect(response.status, `${invalid.action} on ${invalid.id}`).toBe(409);
    }

    // The refused transitions changed nothing.
    const distributed = await containerOf("240106");
    expect(new Date(distributed.containerized_at).toISOString()).toBe(
      CONTAINERIZED_AT.toISOString(),
    );
    expect(new Date(distributed.distributed_at).toISOString()).toBe(
      DISTRIBUTED_AT.toISOString(),
    );
    const empote = await containerOf("240105");
    expect(new Date(empote.containerized_at).toISOString()).toBe(CONTAINERIZED_AT.toISOString());
  });

  it("fait reculer le Statut de la Demande Distribuée → Empotée → En attente", async () => {
    const { container, demand } = await attributedContainer(4);
    expect((await demandOf(demand.id)).status).toBe("IN_PROGRESS");

    await transition(container.id, "containerize");
    expect((await demandOf(demand.id)).status).toBe("CONTAINERIZED");

    await transition(container.id, "distribute");
    expect((await demandOf(demand.id)).status).toBe("DISTRIBUTED");

    await transition(container.id, "undistribute");
    expect((await demandOf(demand.id)).status).toBe("CONTAINERIZED");

    await transition(container.id, "uncontainerize");
    expect((await demandOf(demand.id)).status).toBe("IN_PROGRESS");
  });

  it("rejette une action inconnue en 400", async () => {
    await seed();
    await createContainer({ id: "240107", packaging: PackagingType.CARDBOARD });

    const response = await transition("240107", "teleport");

    expect(response.status).toBe(400);
  });

  it("refuse de détacher un Contenant daté via l'édition (409)", async () => {
    const { container, demand } = await attributedContainer(4);
    await transition(container.id, "containerize");

    const response = await patchContainer(
      jsonRequest(CONTAINERS_URL, "PATCH", { id: container.id, demand_id: null }),
    );

    expect(response.status).toBe(409);
    const stored = await containerOf(container.id);
    expect(stored.demand_id).toBe(demand.id);
    expect(stored.containerized_at).not.toBeNull();
  });

  it("refuse de déplacer un Contenant daté vers une autre Demande (409)", async () => {
    const { container, demand, association } = await attributedContainer(4);
    await transition(container.id, "containerize");
    const otherDemand = await createDemand(association.id);

    const response = await patchContainer(
      jsonRequest(CONTAINERS_URL, "PATCH", { id: container.id, demand_id: otherDemand.id }),
    );

    expect(response.status).toBe(409);
    expect((await containerOf(container.id)).demand_id).toBe(demand.id);
  });

  it("accepte un PATCH d'un Contenant daté qui conserve le même rattachement", async () => {
    const { container, demand } = await attributedContainer(4);
    await transition(container.id, "containerize");

    const response = await patchContainer(
      jsonRequest(CONTAINERS_URL, "PATCH", {
        id: container.id,
        packaging: PackagingType.FILM,
        demand_id: demand.id,
      }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.demand_id).toBe(demand.id);
    expect(body.packaging).toBe(PackagingType.FILM);
    expect(body.containerized_at).not.toBeNull();
  });

  it("laisse détacher un Contenant non daté vers une autre Demande", async () => {
    const { container, association } = await attributedContainer(4);
    const otherDemand = await createDemand(association.id);

    const response = await patchContainer(
      jsonRequest(CONTAINERS_URL, "PATCH", { id: container.id, demand_id: otherDemand.id }),
    );

    expect(response.status).toBe(200);
    expect((await response.json()).demand_id).toBe(otherDemand.id);
  });

  it("préserve les Contenus quand contents est absent du PATCH, les remplace sinon", async () => {
    const { container, articleType } = await attributedContainer(4);

    const withoutContents = await patchContainer(
      jsonRequest(CONTAINERS_URL, "PATCH", { id: container.id, packaging: PackagingType.FILM }),
    );
    const kept = await withoutContents.json();

    expect(withoutContents.status).toBe(200);
    expect(kept.contents).toHaveLength(1);
    expect(kept.contents[0].quantity).toBe(4);
    expect(kept.contents[0].type.id).toBe(articleType.id);
    expect(kept.weight).toBeCloseTo(4);

    const withEmptyContents = await patchContainer(
      jsonRequest(CONTAINERS_URL, "PATCH", { id: container.id, contents: [] }),
    );
    const emptied = await withEmptyContents.json();

    expect(withEmptyContents.status).toBe(200);
    expect(emptied.contents).toHaveLength(0);
    expect(emptied.weight).toBe(0);
  });
});

describe("Rattachement d'un Contenant daté", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("est refusé en 409 à la création d'une Demande via linkedContainers", async () => {
    const { articleType, association } = await seed();
    const dated = await createContainer({
      id: "240201",
      packaging: PackagingType.CARDBOARD,
      containerized_at: CONTAINERIZED_AT,
      contents: { create: [{ type_id: articleType.id, quantity: 3 }] },
    });

    const response = await postDemand(
      jsonRequest(DEMANDS_URL, "POST", {
        association_id: association.id,
        containers: [],
        linkedContainers: [{ id: dated.id }],
      }),
    );

    expect(response.status).toBe(409);
    expect((await containerOf(dated.id)).demand_id).toBeNull();
    expect((await containerOf(dated.id)).state.text).toBe("Empoté");
  });

  it("est refusé en 409 à la mise à jour via linkedContainers", async () => {
    const { articleType, association } = await seed();
    const source = await createDemand(association.id);
    const dated = await createContainer({
      id: "240202",
      packaging: PackagingType.CARDBOARD,
      demand: { connect: { id: source.id } },
      containerized_at: CONTAINERIZED_AT,
      contents: { create: [{ type_id: articleType.id, quantity: 3 }] },
    });
    const target = await createDemand(association.id);

    const response = await patchDemand(
      jsonRequest(DEMANDS_URL, "PATCH", {
        id: target.id,
        association_id: association.id,
        containers: [],
        linkedContainers: [{ id: dated.id }],
      }),
    );

    expect(response.status).toBe(409);
    expect((await containerOf(dated.id)).demand_id).toBe(source.id);
  });

  it("est refusé en 409 à la mise à jour via containers", async () => {
    const { articleType, association } = await seed();
    const source = await createDemand(association.id);
    const dated = await createContainer({
      id: "240203",
      packaging: PackagingType.CARDBOARD,
      demand: { connect: { id: source.id } },
      distributed_at: DISTRIBUTED_AT,
      containerized_at: CONTAINERIZED_AT,
      contents: { create: [{ type_id: articleType.id, quantity: 3 }] },
    });
    const target = await createDemand(association.id);

    const response = await patchDemand(
      jsonRequest(DEMANDS_URL, "PATCH", {
        id: target.id,
        association_id: association.id,
        containers: [
          {
            id: dated.id,
            packaging: PackagingType.CARDBOARD,
            contents: [{ type_id: articleType.id, quantity: 3 }],
          },
        ],
        linkedContainers: [],
      }),
    );

    expect(response.status).toBe(409);
    expect((await containerOf(dated.id)).demand_id).toBe(source.id);
  });

  it("accepte de ré-enregistrer une Demande contenant ses propres Contenants datés", async () => {
    const { container, demand, articleType } = await attributedContainer(4);
    await transition(container.id, "containerize");

    const response = await patchDemand(
      jsonRequest(DEMANDS_URL, "PATCH", {
        id: demand.id,
        containers: [
          {
            id: container.id,
            packaging: PackagingType.CARDBOARD,
            contents: [{ type_id: articleType.id, quantity: 4 }],
          },
        ],
        linkedContainers: [{ id: container.id }],
      }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.containers[0].id).toBe(container.id);
    expect(body.containers[0].containerized_at).not.toBeNull();
  });

  it("accepte de rattacher un Contenant non daté à la création", async () => {
    const { articleType, association } = await seed();
    const free = await createContainer({
      id: "240204",
      packaging: PackagingType.CARDBOARD,
      contents: { create: [{ type_id: articleType.id, quantity: 2 }] },
    });

    const response = await postDemand(
      jsonRequest(DEMANDS_URL, "POST", {
        association_id: association.id,
        containers: [],
        linkedContainers: [{ id: free.id }],
      }),
    );

    expect(response.status).toBe(200);
    expect((await containerOf(free.id)).demand_id).toBe((await response.json()).id);
  });
});

import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";
import { GET as getDemands, PATCH as patchDemand, POST as postDemand } from "@/app/api/demands/route";
import { PATCH as patchContainer } from "@/app/api/containers/route";
import { PackagingType } from "@/lib/generated/prisma";
import { DemandDto } from "@/app/api/demands/dto/demand.dto";
import { createDonationWithArticle, resetDatabase, seed } from "./helpers/db";
import { demandBody, jsonRequest } from "./helpers/http";

const DEMANDS_URL = "http://localhost/api/demands";
const CONTAINERS_URL = "http://localhost/api/containers";

/** Reads a Demand's derived status through the API, never the database. */
async function demandStatusOf(id: string): Promise<string> {
  const response = await getDemands(new NextRequest(`${DEMANDS_URL}?id=${id}`));
  const body = await response.json();
  return body.status;
}

function containerize(id: string) {
  return patchContainer(jsonRequest(CONTAINERS_URL, "PATCH", { id, action: "containerize" }));
}

function distribute(id: string) {
  return patchContainer(jsonRequest(CONTAINERS_URL, "PATCH", { id, action: "distribute" }));
}

type ApiContainer = { id: string; contents: { id: string; quantity: number }[] };

function containerWithQuantity(demand: { containers: ApiContainer[] }, quantity: number): ApiContainer {
  const container = demand.containers.find((c) => c.contents[0]?.quantity === quantity);
  if (!container) throw new Error(`No container with quantity ${quantity}`);
  return container;
}

describe("Demand status is derived from its Containers", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("is En attente for a demand with no container", async () => {
    const { association } = await seed();

    const created = await postDemand(
      jsonRequest(DEMANDS_URL, "POST", { association_id: association.id, containers: [], linkedContainers: [] }),
    );
    const demand = await created.json();

    expect(await demandStatusOf(demand.id)).toBe("IN_PROGRESS");
  });

  it("stays En attente while every container is only attributed", async () => {
    const { articleType, association } = await seed();
    await createDonationWithArticle(articleType.id, 100);

    const created = await postDemand(
      jsonRequest(
        DEMANDS_URL,
        "POST",
        demandBody(association.id, [
          { type_id: articleType.id, quantity: 10 },
          { type_id: articleType.id, quantity: 20 },
        ]),
      ),
    );
    const demand = await created.json();

    expect(await demandStatusOf(demand.id)).toBe("IN_PROGRESS");
  });

  it("is Empotée once every container is empoté", async () => {
    const { articleType, association } = await seed();
    await createDonationWithArticle(articleType.id, 100);

    const created = await postDemand(
      jsonRequest(
        DEMANDS_URL,
        "POST",
        demandBody(association.id, [
          { type_id: articleType.id, quantity: 10 },
          { type_id: articleType.id, quantity: 20 },
        ]),
      ),
    );
    const demand = await created.json();

    await containerize(containerWithQuantity(demand, 10).id);
    await containerize(containerWithQuantity(demand, 20).id);

    expect(await demandStatusOf(demand.id)).toBe("CONTAINERIZED");
  });

  it("stays En attente while only some containers are empotés", async () => {
    const { articleType, association } = await seed();
    await createDonationWithArticle(articleType.id, 100);

    const created = await postDemand(
      jsonRequest(
        DEMANDS_URL,
        "POST",
        demandBody(association.id, [
          { type_id: articleType.id, quantity: 10 },
          { type_id: articleType.id, quantity: 20 },
        ]),
      ),
    );
    const demand = await created.json();

    await containerize(containerWithQuantity(demand, 10).id);

    expect(await demandStatusOf(demand.id)).toBe("IN_PROGRESS");
  });

  it("is Empotée when containers are a mix of empoté and distribué", async () => {
    const { articleType, association } = await seed();
    await createDonationWithArticle(articleType.id, 100);

    const created = await postDemand(
      jsonRequest(
        DEMANDS_URL,
        "POST",
        demandBody(association.id, [
          { type_id: articleType.id, quantity: 10 },
          { type_id: articleType.id, quantity: 20 },
        ]),
      ),
    );
    const demand = await created.json();

    const first = containerWithQuantity(demand, 10).id;
    const second = containerWithQuantity(demand, 20).id;
    await containerize(first);
    await containerize(second);
    await distribute(first);

    expect(await demandStatusOf(demand.id)).toBe("CONTAINERIZED");
  });

  it("is Distribuée once every container is distribué", async () => {
    const { articleType, association } = await seed();
    await createDonationWithArticle(articleType.id, 100);

    const created = await postDemand(
      jsonRequest(
        DEMANDS_URL,
        "POST",
        demandBody(association.id, [
          { type_id: articleType.id, quantity: 10 },
          { type_id: articleType.id, quantity: 20 },
        ]),
      ),
    );
    const demand = await created.json();

    const first = containerWithQuantity(demand, 10).id;
    const second = containerWithQuantity(demand, 20).id;
    await containerize(first);
    await containerize(second);
    await distribute(first);
    await distribute(second);

    expect(await demandStatusOf(demand.id)).toBe("DISTRIBUTED");
  });

  it("exposes a renderable status date on the client (dates revived from JSON)", async () => {
    const { articleType, association } = await seed();
    await createDonationWithArticle(articleType.id, 100);

    const created = await postDemand(
      jsonRequest(DEMANDS_URL, "POST", demandBody(association.id, [{ type_id: articleType.id, quantity: 10 }])),
    );
    const demand = await created.json();
    await containerize(containerWithQuantity(demand, 10).id);

    const response = await getDemands(new NextRequest(`${DEMANDS_URL}?id=${demand.id}`));
    const json = await response.json();
    // The demands page parses the raw API JSON client-side before rendering.
    const dto = await DemandDto.parseWithDocumentUrl(json);

    expect(dto.status).toBe("CONTAINERIZED");
    expect(DemandDto.statusDate(dto)).toBeInstanceOf(Date);
  });

  it("is promoted to Empotée when the last attributed container is detached", async () => {
    const { articleType, association } = await seed();
    await createDonationWithArticle(articleType.id, 100);

    const created = await postDemand(
      jsonRequest(
        DEMANDS_URL,
        "POST",
        demandBody(association.id, [
          { type_id: articleType.id, quantity: 10 },
          { type_id: articleType.id, quantity: 20 },
        ]),
      ),
    );
    const demand = await created.json();

    const empote = containerWithQuantity(demand, 10);
    await containerize(empote.id);
    expect(await demandStatusOf(demand.id)).toBe("IN_PROGRESS");

    const attendance = await patchDemand(
      jsonRequest(DEMANDS_URL, "PATCH", {
        id: demand.id,
        association_id: association.id,
        containers: [
          {
            id: empote.id,
            packaging: PackagingType.CARDBOARD,
            contents: [{ type_id: articleType.id, quantity: 10 }],
          },
        ],
        linkedContainers: [],
      }),
    );
    expect(attendance.status).toBe(200);

    expect(await demandStatusOf(demand.id)).toBe("CONTAINERIZED");
  });
});

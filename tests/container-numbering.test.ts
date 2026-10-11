import { beforeEach, describe, expect, it } from "vitest";
import { PATCH as patchDemand, POST as postDemand } from "@/app/api/demands/route";
import { prisma } from "@/app/api/prisma";
import { PackagingType } from "@/lib/generated/prisma";
import { createAssociation, resetDatabase } from "./helpers/db";
import { jsonRequest } from "./helpers/http";

describe("container numbering", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("does not reuse a number held by a container attached to a previous-year demand", async () => {
    const association = await createAssociation();

    const yy = String(new Date().getFullYear() % 100);
    const lastYearStart = new Date(new Date().getFullYear() - 1, 0, 1);
    const oldDemand = await prisma.demand.create({
      data: { association_id: association.id, created_at: lastYearStart },
    });
    await prisma.container.create({
      data: {
        id: `${yy}0002`,
        weight: 0,
        volume: 0,
        value: 0,
        packaging: PackagingType.CARDBOARD,
        demand_id: oldDemand.id,
      },
    });

    const created = await postDemand(
      jsonRequest("http://localhost/api/demands", "POST", {
        association_id: association.id,
        containers: [{ packaging: PackagingType.CARDBOARD, contents: [] }],
        linkedContainers: [],
      }),
    );
    const demand = await created.json();
    expect(demand.containers[0].id).not.toBe(`${yy}0002`);

    const response = await patchDemand(
      jsonRequest("http://localhost/api/demands", "PATCH", {
        id: demand.id,
        association_id: association.id,
        containers: [
          { id: demand.containers[0].id, packaging: PackagingType.CARDBOARD, contents: [] },
          { packaging: PackagingType.CARDBOARD, contents: [] },
        ],
        linkedContainers: [],
      }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    const ids = body.containers.map((container: { id: string }) => container.id);
    expect(new Set(ids).size).toBe(2);
    expect(ids).not.toContain(`${yy}0002`);
  });
});

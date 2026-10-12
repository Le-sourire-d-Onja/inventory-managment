import { beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { PackagingType } from "@/lib/generated/prisma";
import { GET as getStocks } from "@/app/api/stocks/route";
import {
  createArticleType,
  createContainer,
  createDemand,
  createDonationWithArticle,
  resetDatabase,
  seed,
} from "./helpers/db";
import { stockQuantityOf } from "./helpers/http";

describe("GET /api/stocks (aggregation)", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("counts donated articles as available stock", async () => {
    const { articleType } = await seed();
    await createDonationWithArticle(articleType.id, 100);

    expect(await stockQuantityOf(articleType.id)).toBe(100);
  });

  it("does not decrement stock for a free container", async () => {
    const { articleType } = await seed();
    await createDonationWithArticle(articleType.id, 100);
    await createContainer({
      packaging: PackagingType.CARDBOARD,
      contents: { create: [{ type_id: articleType.id, quantity: 30 }] },
    });

    expect(await stockQuantityOf(articleType.id)).toBe(100);
  });

  it("decrements stock as soon as a container is attributed", async () => {
    const { articleType, association } = await seed();
    await createDonationWithArticle(articleType.id, 100);
    const demand = await createDemand(association.id);
    await createContainer({
      packaging: PackagingType.CARDBOARD,
      demand: { connect: { id: demand.id } },
      contents: { create: [{ type_id: articleType.id, quantity: 30 }] },
    });

    expect(await stockQuantityOf(articleType.id)).toBe(70);
  });

  it("type=container counts only the contents of Empoté containers", async () => {
    const { articleType, association } = await seed();
    await createDonationWithArticle(articleType.id, 100);

    // Empoté -> counted.
    const empote = await createDemand(association.id);
    await createContainer({
      packaging: PackagingType.CARDBOARD,
      demand: { connect: { id: empote.id } },
      containerized_at: new Date(),
      contents: { create: [{ type_id: articleType.id, quantity: 30 }] },
    });

    const alsoEmpote = await createDemand(association.id);
    await createContainer({
      packaging: PackagingType.CARDBOARD,
      demand: { connect: { id: alsoEmpote.id } },
      containerized_at: new Date(),
      contents: { create: [{ type_id: articleType.id, quantity: 40 }] },
    });

    // Attributed but not yet containerized -> excluded.
    const attributed = await createDemand(association.id);
    await createContainer({
      packaging: PackagingType.CARDBOARD,
      demand: { connect: { id: attributed.id } },
      contents: { create: [{ type_id: articleType.id, quantity: 10 }] },
    });

    // Distributed -> excluded.
    const distributed = await createDemand(association.id);
    await createContainer({
      packaging: PackagingType.CARDBOARD,
      demand: { connect: { id: distributed.id } },
      containerized_at: new Date(),
      distributed_at: new Date(),
      contents: { create: [{ type_id: articleType.id, quantity: 20 }] },
    });

    expect(await stockQuantityOf(articleType.id, "container")).toBe(70);
  });

  it("type=container lists only the types held by Empoté containers, including types with no donation", async () => {
    const { articleType, association } = await seed();
    await createDonationWithArticle(articleType.id, 100);

    // This type never appears in any Donation (no Article row): it exists only
    // as a Content inside an Empoté container. It must still be exported.
    const orphanType = await createArticleType({
      name: "Orphelin",
      weight: 2,
      volume: 0.5,
      value: 3,
    });

    const demand = await createDemand(association.id);
    await createContainer({
      packaging: PackagingType.CARDBOARD,
      demand: { connect: { id: demand.id } },
      containerized_at: new Date(),
      contents: {
        create: [
          { type_id: orphanType.id, quantity: 7 },
          { type_id: articleType.id, quantity: 4 },
        ],
      },
    });

    // Attribué but not yet Empoté: excluded, and must not produce a 0 row.
    const attributed = await createDemand(association.id);
    await createContainer({
      packaging: PackagingType.CARDBOARD,
      demand: { connect: { id: attributed.id } },
      contents: { create: [{ type_id: articleType.id, quantity: 10 }] },
    });

    const response = await getStocks(
      new NextRequest("http://localhost/api/stocks?type=container"),
    );
    const body = (await response.json()) as {
      type: { id: string; name: string };
      quantity: number;
      weight: number;
      volume: number;
      value: number;
    }[];

    expect(body).toHaveLength(2);

    const orphan = body.find((stock) => stock.type.id === orphanType.id);
    expect(orphan).toBeDefined();
    expect(orphan!.quantity).toBe(7);
    expect(orphan!.weight).toBe(14);
    expect(orphan!.volume).toBeCloseTo(3.5);
    expect(orphan!.value).toBe(21);

    const riz = body.find((stock) => stock.type.id === articleType.id);
    expect(riz).toBeDefined();
    expect(riz!.quantity).toBe(4);
  });
});

import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";
import { GET } from "@/app/api/stocks/route";
import { DemandStatus, PackagingType } from "@/lib/generated/prisma";
import {
  createContainer,
  createDemand,
  createDonationWithArticle,
  resetDatabase,
  seed,
} from "./helpers/db";

async function stockQuantityOf(typeId: string): Promise<number> {
  const response = await GET(new NextRequest("http://localhost/api/stocks"));
  const body = (await response.json()) as { type: { id: string }; quantity: number }[];
  return body.find((stock) => stock.type.id === typeId)?.quantity ?? 0;
}

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

  it("decrements stock as soon as a container is attributed, whatever the demand status", async () => {
    const { articleType, association } = await seed();
    await createDonationWithArticle(articleType.id, 100);
    const demand = await createDemand(association.id, { status: DemandStatus.IN_PROGRESS });
    await createContainer({
      packaging: PackagingType.CARDBOARD,
      demand: { connect: { id: demand.id } },
      contents: { create: [{ type_id: articleType.id, quantity: 30 }] },
    });

    expect(await stockQuantityOf(articleType.id)).toBe(70);
  });
});

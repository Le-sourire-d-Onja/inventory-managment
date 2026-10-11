import { beforeEach, describe, expect, it } from "vitest";
import { DemandStatus, PackagingType } from "@/lib/generated/prisma";
import {
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

  it("type=container keeps its historical meaning: only validated demands' contents", async () => {
    const { articleType, association } = await seed();
    await createDonationWithArticle(articleType.id, 100);
    const validated = await createDemand(association.id, { status: DemandStatus.VALIDATED });
    await createContainer({
      packaging: PackagingType.CARDBOARD,
      demand: { connect: { id: validated.id } },
      contents: { create: [{ type_id: articleType.id, quantity: 30 }] },
    });
    const inProgress = await createDemand(association.id, { status: DemandStatus.IN_PROGRESS });
    await createContainer({
      packaging: PackagingType.CARDBOARD,
      demand: { connect: { id: inProgress.id } },
      contents: { create: [{ type_id: articleType.id, quantity: 40 }] },
    });

    expect(await stockQuantityOf(articleType.id, "container")).toBe(30);
  });

  it("type=demand keeps its historical meaning: only in-progress demands' contents", async () => {
    const { articleType, association } = await seed();
    await createDonationWithArticle(articleType.id, 100);
    const validated = await createDemand(association.id, { status: DemandStatus.VALIDATED });
    await createContainer({
      packaging: PackagingType.CARDBOARD,
      demand: { connect: { id: validated.id } },
      contents: { create: [{ type_id: articleType.id, quantity: 30 }] },
    });
    const inProgress = await createDemand(association.id, { status: DemandStatus.IN_PROGRESS });
    await createContainer({
      packaging: PackagingType.CARDBOARD,
      demand: { connect: { id: inProgress.id } },
      contents: { create: [{ type_id: articleType.id, quantity: 40 }] },
    });

    expect(await stockQuantityOf(articleType.id, "demand")).toBe(60);
  });
});

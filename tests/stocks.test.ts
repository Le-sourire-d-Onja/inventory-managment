import { beforeEach, describe, expect, it } from "vitest";
import { PackagingType } from "@/lib/generated/prisma";
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
});

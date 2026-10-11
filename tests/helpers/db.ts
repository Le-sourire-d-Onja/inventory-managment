import { prisma } from "@/app/api/prisma";
import {
  AssociationType,
  DemandStatus,
  PackagingType,
  Prisma,
} from "@/lib/generated/prisma";

/**
 * Removes every row from the test database in foreign-key-safe order so every
 * test starts from a deterministic, empty state. Called from `beforeEach`.
 */
export async function resetDatabase(): Promise<void> {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "Content", "Article", "Container", "Demand", "Association", "ArticleType", "Donation" RESTART IDENTITY CASCADE',
  );
}

let sequence = 0;
function uniq(prefix: string): string {
  sequence += 1;
  return `${prefix}-${sequence}`;
}

export async function createArticleType(
  overrides: Partial<Prisma.ArticleTypeCreateInput> = {},
) {
  return prisma.articleType.create({
    data: {
      name: uniq("Article"),
      weight: 1,
      volume: 0.001,
      value: 1,
      ...overrides,
    },
  });
}

export async function createAssociation(
  overrides: Partial<Prisma.AssociationCreateInput> = {},
) {
  return prisma.association.create({
    data: {
      name: uniq("Association"),
      type: AssociationType.ASSOCIATION,
      person_in_charge: "Responsable Test",
      address: "1 rue des Tests",
      email: "test@example.com",
      phone: "0102030405",
      description: "Association de test",
      ...overrides,
    },
  });
}

export async function createDemand(
  associationId: string,
  overrides: Partial<Omit<Prisma.DemandCreateInput, "association">> = {},
) {
  return prisma.demand.create({
    data: {
      status: DemandStatus.IN_PROGRESS,
      association: { connect: { id: associationId } },
      ...overrides,
    },
  });
}

export async function createContainer(
  overrides: Partial<Prisma.ContainerCreateInput> = {},
) {
  return prisma.container.create({
    data: {
      id: uniq("24"),
      weight: 0,
      volume: 0,
      value: 0,
      packaging: PackagingType.CARDBOARD,
      ...overrides,
    },
  });
}

/**
 * Seeds a minimal baseline that later tickets can build on: one article type
 * and one association. Returns both so tests can reference their ids.
 */
export async function seed() {
  const articleType = await createArticleType({
    name: "Riz",
    weight: 1,
    volume: 0.001,
    value: 2.5,
  });
  const association = await createAssociation({ name: "Association Test" });
  return { articleType, association };
}

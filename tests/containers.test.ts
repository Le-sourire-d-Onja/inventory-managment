import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it } from "vitest";
import { GET } from "@/app/api/containers/route";
import { prisma } from "@/app/api/prisma";
import { PackagingType } from "@/lib/generated/prisma";
import {
  createContainer,
  resetDatabase,
  seed,
} from "./helpers/db";

describe("GET /api/containers", () => {
  beforeEach(async () => {
    await resetDatabase();
  });

  it("runs against the dedicated test database", async () => {
    const rows = await prisma.$queryRaw<{ db: string }[]>`
      SELECT current_database() AS db
    `;
    expect(rows[0].db).toMatch(/_test/);
  });

  it("returns 200 and the seeded free container", async () => {
    const { articleType } = await seed();
    await createContainer({
      id: "240001",
      weight: 10,
      volume: 0.5,
      value: 25,
      packaging: PackagingType.CARDBOARD,
      contents: { create: [{ type_id: articleType.id, quantity: 10 }] },
    });

    const request = new NextRequest("http://localhost/api/containers");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe("240001");
    expect(body[0].contents).toHaveLength(1);
  });
});

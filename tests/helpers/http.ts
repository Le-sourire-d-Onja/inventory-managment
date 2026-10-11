import { NextRequest } from "next/server";
import { GET as getStocks } from "@/app/api/stocks/route";
import { PackagingType } from "@/lib/generated/prisma";

/**
 * Builds a JSON `NextRequest` for a route handler, used by every test file
 * that exercises POST/PATCH behaviours.
 */
export function jsonRequest(url: string, method: string, body: unknown): NextRequest {
  return new NextRequest(url, {
    method,
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Reads a type's quantity from the stocks route. Mirrors the API contract under
 * test rather than reaching into the database.
 */
export async function stockQuantityOf(
  typeId: string,
  mode: "stock" | "container" | "demand" = "stock",
): Promise<number> {
  const response = await getStocks(new NextRequest(`http://localhost/api/stocks?type=${mode}`));
  const body = (await response.json()) as { type: { id: string }; quantity: number }[];
  return body.find((stock) => stock.type.id === typeId)?.quantity ?? 0;
}

/**
 * Builds a demand body with one Container per Content, matching the shape the
 * UI sends when creating or updating a Demand.
 */
export function demandBody(
  associationId: string,
  contents: { type_id: string; quantity: number }[],
) {
  return {
    association_id: associationId,
    containers: contents.map((content) => ({
      packaging: PackagingType.CARDBOARD,
      contents: [content],
    })),
    linkedContainers: [],
  };
}

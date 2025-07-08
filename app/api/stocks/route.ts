import { NextRequest, NextResponse } from "next/server";
import StocksService from "./stocks.service";
import { ArticleType } from "@/lib/generated/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const typeIDs = JSON.parse(searchParams.get('types') ?? "[]") as string[];
  if (typeIDs.length === 0) {
    return NextResponse.json({ message: "Type not found in stock" }, { status: 404 });
  }
  const data = await StocksService.findOne(typeIDs);
  return NextResponse.json(data);
}
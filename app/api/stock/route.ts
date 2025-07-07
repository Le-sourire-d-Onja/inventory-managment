import { NextRequest, NextResponse } from "next/server";
import { ArticleType } from "@/lib/generated/prisma";
import StocksService from "../stocks/stocks.service";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type');
  if (!ArticleType[type]) {
    return NextResponse.json({ message: "Type not found in stock" }, { status: 404 });
  }
  const data = await StocksService.findOne(ArticleType[type]);
  return NextResponse.json(data);
}
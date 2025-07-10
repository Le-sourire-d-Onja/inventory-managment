import { NextRequest, NextResponse } from "next/server";
import StocksService from "./stocks.service";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const typeIDs = JSON.parse(searchParams.get('types') ?? "[]") as string[];
  const data = await StocksService.findAll(typeIDs);
  return NextResponse.json(data);
}
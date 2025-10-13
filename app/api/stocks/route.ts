import { NextRequest, NextResponse } from "next/server";
import StocksService from "./stocks.service";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') ?? 'stock';
  if (!['stock', 'container', 'demand'].includes(type)) {
    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  }
  const data = await StocksService.findAll(type as "stock" | "container" | "demand");
  return NextResponse.json(data);
}
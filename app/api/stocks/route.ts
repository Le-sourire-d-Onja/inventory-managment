import { NextRequest, NextResponse } from "next/server";
import StocksService from "./stocks.service";

export async function GET(_: NextRequest) {
  const data = await StocksService.findAll();
  return NextResponse.json(data);
}
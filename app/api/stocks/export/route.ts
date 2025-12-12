import { ExportsService } from "@/app/api/exports/exports.service";
import { NextRequest, NextResponse } from "next/server";
import StocksService from "../stocks.service";
import { StockDto } from "../dto/stock.dto";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') ?? 'stock';
  if (!['stock', 'container'].includes(type)) {
    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  }
  const stocksStock = await StocksService.findAll(type as "stock" | "container");
  const exportData = stocksStock.map((stock) => StockDto.exportValues(stock));
  const exportHeaders = StockDto.exportHeaders();
  const buffer = await ExportsService.export(exportHeaders, exportData);
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=export.xlsx",
    },
  });
}
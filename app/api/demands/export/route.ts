import { ExportsService } from "@/app/api/exports/exports.service";
import { NextResponse } from "next/server";
import { DemandDto } from "../dto/demand.dto";
import DemandsService from "../demands.service";

export async function GET() {
  const demands = await DemandsService.findAll();
  const exportData = demands.map((demand) => DemandDto.exportValues(demand));
  const exportHeaders = DemandDto.exportHeaders();
  const buffer = await ExportsService.export(exportHeaders, exportData);
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=export.xlsx",
    },
  });
}
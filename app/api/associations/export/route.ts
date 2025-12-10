import { ExportsService } from "@/app/api/exports/exports.service";
import AssociationsService from "../associations.service";
import { AssociationDto } from "../dto/association.dto";
import { NextResponse } from "next/server";

export async function GET() {
  const associations = await AssociationsService.findAll();
  const exportData = associations.map((association) => AssociationDto.exportValues(association));
  const exportHeaders = AssociationDto.exportHeaders();
  const buffer = await ExportsService.export(exportHeaders, exportData);
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=export.xlsx",
    },
  });
}
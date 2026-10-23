import { ExportsService } from "@/app/api/exports/exports.service";
import AssociationsService from "../associations.service";
import { AssociationDto } from "../dto/association.dto";
import { AssociationExportDto } from "../dto/association-export.dto";
import { NextRequest, NextResponse } from "next/server";

const XLSX_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  if (!searchParams.has("id")) {
    const associations = await AssociationsService.findAll();
    const exportData = associations.map((association) => AssociationDto.exportValues(association));
    const exportHeaders = AssociationDto.exportHeaders();
    const buffer = await ExportsService.export(exportHeaders, exportData);
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": XLSX_MIME,
        "Content-Disposition": "attachment; filename=export.xlsx",
      },
    });
  }

  // An explicit but empty `?id=` is a client error, not a request for the
  // global export: only the absence of the parameter keeps that behaviour.
  const id = searchParams.get("id");
  const association = id ? await AssociationsService.findForExport(id) : null;
  if (!association) {
    return NextResponse.json({ error: "Association not found" }, { status: 404 });
  }

  const buffer = await ExportsService.exportSheets(association.sheets());
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": XLSX_MIME,
      "Content-Disposition": `attachment; filename="${AssociationExportDto.fileName(association.association)}"`,
    },
  });
}

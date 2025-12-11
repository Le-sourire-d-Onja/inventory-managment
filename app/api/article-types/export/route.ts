import { ExportsService } from "@/app/api/exports/exports.service";
import ArticleTypesService from "../article-types.service";
import { NextResponse } from "next/server";
import { ArticleTypeDto } from "../dto/article-types.dto";

export async function GET() {
  const associations = await ArticleTypesService.findAll();
  const exportData = associations.map((association) => ArticleTypeDto.exportValues(association));
  const exportHeaders = ArticleTypeDto.exportHeaders();
  const buffer = await ExportsService.export(exportHeaders, exportData);
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=export.xlsx",
    },
  });
}
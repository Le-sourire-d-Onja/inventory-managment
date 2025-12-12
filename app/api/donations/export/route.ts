import { ExportsService } from "@/app/api/exports/exports.service";
import { NextResponse } from "next/server";
import DonationsService from "../donations.service";
import { ArticleDto } from "../dto/article.dto";

export async function GET() {
  const donations = await DonationsService.findAll();
  const exportData = donations.flatMap((donation) => donation.articles.map((article) => ArticleDto.exportValues(article)));
  const exportHeaders = ArticleDto.exportHeaders();
  const buffer = await ExportsService.export(exportHeaders, exportData);
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=export.xlsx",
    },
  });
}
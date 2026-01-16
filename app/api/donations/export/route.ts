import { ExportsService } from "@/app/api/exports/exports.service";
import { NextResponse } from "next/server";
import DonationsService from "../donations.service";
import { DonationDto } from "../dto/donation.dto";

export async function GET() {
  const donations = await DonationsService.findAll();
  const exportData = donations.map((donation) => DonationDto.exportValues(donation));
  const exportHeaders = DonationDto.exportHeaders();
  const buffer = await ExportsService.export(exportHeaders, exportData);
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=export.xlsx",
    },
  });
}
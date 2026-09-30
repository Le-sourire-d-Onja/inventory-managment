import { ExportsService } from "@/app/api/exports/exports.service";
import { NextResponse } from "next/server";
import ContainersService from "../containers.service";
import { ContainerDto } from "../dto/container.dto";

export async function GET() {
  const containers = await ContainersService.findByScope("all");
  const exportData = containers.map((container) => ContainerDto.exportValues(container));
  const exportHeaders = ContainerDto.exportHeaders();
  const buffer = await ExportsService.export(exportHeaders, exportData);
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=export.xlsx",
    },
  });
}

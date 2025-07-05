import { NextRequest, NextResponse } from "next/server";
import DonationsService from "./donations.service";

export async function GET(request: NextRequest) {
  const data = await DonationsService.findAll();
  return NextResponse.json(data);
}
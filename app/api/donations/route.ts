import { NextRequest } from "next/server";
import DonationsService from "./donations.service";

export async function GET(request: NextRequest) {
  return DonationsService.findAll();
}
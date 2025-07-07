import { NextRequest, NextResponse } from "next/server";
import DonationsService from "./donations.service";
import { createDonationSchema } from "./entity/create-donation.entity";
import { updateDonationSchema } from "./entity/update-donation.entity";

export async function GET(_: NextRequest) {
  const data = await DonationsService.findAll();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const createDonation = createDonationSchema.safeParse(body);
  if (!createDonation.success) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }
  const donation = await DonationsService.create(createDonation.data);
  return NextResponse.json(donation);
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const updateDonation = updateDonationSchema.safeParse(body);
  if (!updateDonation.success) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }
  const donation = await DonationsService.update(updateDonation.data);
  return NextResponse.json(donation);
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  const donation = await DonationsService.delete(id);
  return NextResponse.json(donation);
}
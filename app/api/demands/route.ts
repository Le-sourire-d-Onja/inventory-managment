import { NextRequest, NextResponse } from "next/server";
import DemandsService from "./demands.service";
import { createDemandSchema } from "./entity/create-demand.entity";
import { updateDemandSchema } from "./entity/update-demand.entity";

export async function GET(_: NextRequest) {
  const data = await DemandsService.findAll();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const createDemand = createDemandSchema.safeParse(body);
  if (!createDemand.data) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }
  const demand = await DemandsService.create(createDemand.data);
  return NextResponse.json(demand);
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const updateDemand = updateDemandSchema.safeParse(body);
  console.log(updateDemand.error);
  if (!updateDemand.data) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }
  const demand = await DemandsService.update(updateDemand.data);
  return NextResponse.json(demand);
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  const demand = await DemandsService.delete(id);
  return NextResponse.json(demand);
}
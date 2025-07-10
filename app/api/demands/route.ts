import { NextRequest, NextResponse } from "next/server";
import DemandsService from "./demands.service";
import { createDemandSchema } from "./entity/create-demand.entity";
import { updateDemandSchema } from "./entity/update-demand.entity";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  let data;
  if (id) {
    try {
      data = await DemandsService.findOne(id);
    } catch {
      return NextResponse.json({ message: "Not found" }, { status: 404 })
    }
  } else {
    data = await DemandsService.findAll();
  }
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const createDemand = createDemandSchema.safeParse(body);
  if (!createDemand.success) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }
  const demand = await DemandsService.create(createDemand.data);
  return NextResponse.json(demand);
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const updateDemand = updateDemandSchema.safeParse(body);
  if (!updateDemand.success) {
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
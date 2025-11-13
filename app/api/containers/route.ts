import { NextRequest, NextResponse } from "next/server";
import ContainersService from "./containers.service";
import { createContainerSchema } from "./entity/create-container.entity";
import { updateContainerSchema } from "./entity/update-container.entity";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  let data;
  if (id) {
    try {
      data = await ContainersService.findOne(id);
    } catch {
      return NextResponse.json({ message: "Not found" }, { status: 404 })
    }
  } else {
    const inDemand = Boolean(searchParams.get('inDemand'));
    data = await ContainersService.findAll(inDemand);
  }
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const createContainer = createContainerSchema.safeParse(body);
  if (!createContainer.success) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }
  const container = await ContainersService.create(createContainer.data);
  return NextResponse.json(container);
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const updateContainer = updateContainerSchema.safeParse(body);
  if (!updateContainer.success) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }
  const container = await ContainersService.update(updateContainer.data);
  return NextResponse.json(container);
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  const container = await ContainersService.delete(id);
  return NextResponse.json(container);
}
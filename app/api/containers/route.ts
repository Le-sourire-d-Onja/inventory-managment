import { NextRequest, NextResponse } from "next/server";
import ContainersService, { ContainerTransitionError } from "./containers.service";
import { createContainerDtoSchema } from "./dto/create-container.dto";
import { updateContainerDtoSchema } from "./dto/update-container.dto";
import { containerActionDtoSchema } from "./dto/container-action.dto";
import { InsufficientStockError } from "../stocks/stocks.service";

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
    const scope = searchParams.get("scope") === "all" ? "all" : "free";
    data = await ContainersService.findByScope(scope);
  }
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const createContainer = createContainerDtoSchema.safeParse(body);
  if (!createContainer.success) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }
  const container = await ContainersService.create(createContainer.data);
  return NextResponse.json(container);
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();

  if (body && typeof body === "object" && "action" in body) {
    const action = containerActionDtoSchema.safeParse(body);
    if (!action.success) {
      return NextResponse.json({ message: "Bad request" }, { status: 400 });
    }
    try {
      const container = await ContainersService.transition(action.data);
      return NextResponse.json(container);
    } catch (err) {
      if (err instanceof ContainerTransitionError) {
        return NextResponse.json({ message: err.message }, { status: 409 });
      }
      if (err instanceof Error && err.message === "Not found") {
        return NextResponse.json({ message: "Not found" }, { status: 404 });
      }
      throw err;
    }
  }

  const updateContainer = updateContainerDtoSchema.safeParse(body);
  if (!updateContainer.success) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }
  try {
    const container = await ContainersService.update(updateContainer.data);
    return NextResponse.json(container);
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }
    throw error;
  }
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
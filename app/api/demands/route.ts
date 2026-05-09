import { NextRequest, NextResponse } from "next/server";
import DemandsService from "./demands.service";
import { createDemandDtoSchema } from "./dto/create-demand.dto";
import { updateDemandDtoSchema } from "./dto/update-demand.entity";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  let data;
  if (id) {
    try {
      data = await DemandsService.findOne(id);
    } catch {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
  } else {
    data = await DemandsService.findAll();
  }
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  let file: File | null = null;
  let body: unknown;

  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const fileEntry = formData.get("file");
    const bodyEntry = formData.get("body");

    if (fileEntry && fileEntry instanceof File) {
      file = fileEntry;
    }

    if (bodyEntry && typeof bodyEntry === "string") {
      try {
        body = JSON.parse(bodyEntry);
      } catch {
        return NextResponse.json({ message: "Bad request" }, { status: 400 });
      }
    } else {
      body = {};
    }
  } else {
    body = await request.json();
  }

  const createDemand = createDemandDtoSchema.safeParse(body);
  if (!createDemand.success) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }

  const demand = await DemandsService.create(createDemand.data, file);
  return NextResponse.json(demand);
}

export async function PATCH(request: NextRequest) {
  let file: File | null = null;
  let body: unknown;

  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    file = formData.get("file") as File | null;
    const bodyStr = formData.get("body") as string;
    if (bodyStr) {
      body = JSON.parse(bodyStr);
    }
  } else {
    body = await request.json();
  }

  const updateDemand = updateDemandDtoSchema.safeParse(body);
  if (!updateDemand.success) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }

  const demand = await DemandsService.update(updateDemand.data, file);
  return NextResponse.json(demand);
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  const demand = await DemandsService.delete(id);
  return NextResponse.json(demand);
}

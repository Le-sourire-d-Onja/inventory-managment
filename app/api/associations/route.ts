import { NextRequest, NextResponse } from "next/server";
import AssociationsService from "./associations.service";
import { CreateAssociationDto, createAssociationDtoSchema } from "./dto/create-association.dto";
import { updateAssociationDtoSchema } from "./dto/update-association.dto";

export async function GET(_: NextRequest) {
  const data = await AssociationsService.findAll();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const createAssociation = createAssociationDtoSchema.safeParse(body);
  if (!createAssociation.success) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }
  const association = await AssociationsService.create(createAssociation.data as CreateAssociationDto);
  return NextResponse.json(association);
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const updateAssociation = updateAssociationDtoSchema.safeParse(body);
  if (!updateAssociation.success) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }
  const association = await AssociationsService.update(updateAssociation.data);
  return NextResponse.json(association);
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  const association = await AssociationsService.delete(id);
  return NextResponse.json(association);
}
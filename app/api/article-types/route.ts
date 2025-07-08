import { NextRequest, NextResponse } from "next/server";
import ArticleTypesService from "./article-types.service";
import { createArticleTypeSchema } from "./entity/create-article-type.entity";
import { updateArticleTypeSchema } from "./entity/update-article-type.entity";

export async function GET(_: NextRequest) {
  const data = await ArticleTypesService.findAll();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const createArticleType = createArticleTypeSchema.safeParse(body);
  if (!createArticleType.success) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }
  const articleType = await ArticleTypesService.create(createArticleType.data);
  return NextResponse.json(articleType);
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const updateArticleType = updateArticleTypeSchema.safeParse(body);
  console.log(updateArticleType.error);
  if (!updateArticleType.success) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }
  const articleType = await ArticleTypesService.update(updateArticleType.data);
  return NextResponse.json(articleType);
}

export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  const articleType = await ArticleTypesService.delete(id);
  return NextResponse.json(articleType);
}
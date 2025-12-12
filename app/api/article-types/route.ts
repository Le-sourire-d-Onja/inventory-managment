import { NextRequest, NextResponse } from "next/server";
import ArticleTypesService from "./article-types.service";
import { createArticleTypeDtoSchema } from "./dto/create-article-type.dto";
import { updateArticleTypeDtoSchema } from "./dto/update-article-type.entity";

export async function GET(_: NextRequest) {
  const data = await ArticleTypesService.findAll();
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const createArticleType = createArticleTypeDtoSchema.safeParse(body);
  if (!createArticleType.success) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }
  try {
    const articleType = await ArticleTypesService.create(createArticleType.data);
    return NextResponse.json(articleType);
  } catch {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const updateArticleType = updateArticleTypeDtoSchema.safeParse(body);
  if (!updateArticleType.success) {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }
  try {
    const articleType = await ArticleTypesService.update(updateArticleType.data);
    return NextResponse.json(articleType);
  } catch {
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }
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
import { Article, ArticleType } from "@/lib/generated/prisma";

export type ArticleEntity = Article & { type: ArticleType }

export const articleInclude = {
  type: true
}
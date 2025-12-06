import { ArticleType, Content } from "@/lib/generated/prisma";

export type ContentEntity = Content & { type: ArticleType }

export const contentInclude = {
  type: true,
}
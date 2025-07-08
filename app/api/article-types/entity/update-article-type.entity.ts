import z from "zod";
import { createArticleTypeSchema } from "./create-article-type.entity";


export const updateArticleTypeSchema = createArticleTypeSchema.extend({
  id: z.string().uuid().optional(),
});

export type UpdateArticleTypeEntity = z.infer<typeof updateArticleTypeSchema>;
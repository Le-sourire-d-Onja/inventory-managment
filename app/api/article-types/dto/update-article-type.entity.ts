import z from "zod";
import { createArticleTypeDtoSchema } from "./create-article-type.dto";

export const updateArticleTypeDtoSchema = createArticleTypeDtoSchema.extend({
  id: z.string().uuid().optional(),
});

export type UpdateArticleTypeDto = z.infer<typeof updateArticleTypeDtoSchema>;
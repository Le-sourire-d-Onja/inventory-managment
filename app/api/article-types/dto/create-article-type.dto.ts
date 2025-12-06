import z from "zod";

export const createArticleTypeDtoSchema = z.object({
  name: z.string().nonempty(),
  weight: z.number().positive(),
  volume: z.number().positive(),
});

export type CreateArticleTypeDto = z.infer<typeof createArticleTypeDtoSchema>;
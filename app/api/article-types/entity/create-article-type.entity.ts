import z from "zod";

export const createArticleTypeSchema = z.object({
  name: z.string().nonempty(),
  weight: z.number().positive(),
  volume: z.number().positive(),
  price: z.number().positive()
});

export type CreateArticleTypeEntity = z.infer<typeof createArticleTypeSchema>;
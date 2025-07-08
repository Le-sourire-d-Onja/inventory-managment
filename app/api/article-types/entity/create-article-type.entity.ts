import z from "zod";

export const createArticleTypeSchema = z.object({
  name: z.string().nonempty(),
});

export type CreateArticleTypeEntity = z.infer<typeof createArticleTypeSchema>;
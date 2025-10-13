import z from "zod";

export const createArticleSchema = z.object({
  type_id: z.string().uuid(),
  quantity: z.number().min(1),
});

export const createDonationSchema = z.object({
  description: z.string(),
  articles: z.array(createArticleSchema),
});

export type CreateDonationEntity = z.infer<typeof createDonationSchema>; 
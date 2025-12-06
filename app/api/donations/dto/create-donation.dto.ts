import z from "zod";

export const createArticleDtoSchema = z.object({
  type_id: z.string().uuid(),
  quantity: z.number().min(1),
});

export const createDonationDtoSchema = z.object({
  description: z.string(),
  articles: z.array(createArticleDtoSchema),
});

export type CreateDonationDto = z.infer<typeof createDonationDtoSchema>; 
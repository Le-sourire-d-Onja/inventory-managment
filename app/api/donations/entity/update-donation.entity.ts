import z from "zod";
import { createArticleSchema, createDonationSchema } from "./create-donation.entity";

const updateArticleSchema = createArticleSchema.extend({
  id: z.string().uuid().optional()
});

export const updateDonationSchema = createDonationSchema.extend({
  id: z.string().uuid().optional(),
  articles: z.array(updateArticleSchema),
  articlesIDToRemove: z.array(z.string().uuid()),
});

export type UpdateDonationEntity = z.infer<typeof updateDonationSchema>; 
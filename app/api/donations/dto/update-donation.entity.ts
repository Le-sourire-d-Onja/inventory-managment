import z from "zod";
import { createArticleDtoSchema, createDonationDtoSchema } from "./create-donation.dto";

const updateArticleDtoSchema = createArticleDtoSchema.extend({
  id: z.string().uuid().optional()
});

export const updateDonationDtoSchema = createDonationDtoSchema.extend({
  id: z.string().uuid().optional(),
  articles: z.array(updateArticleDtoSchema),
  articlesIDToRemove: z.array(z.string().uuid()),
});

export type UpdateDonationDto = z.infer<typeof updateDonationDtoSchema>;
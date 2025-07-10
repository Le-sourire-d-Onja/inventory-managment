import z from "zod";

export const createArticleSchema = z.object({
  typeID: z.string().uuid(),
  quantity: z.number().min(1),
});

export const createDonationSchema = z.object({
  name: z.string().nonempty(),
  description: z.string(),
  email: z.string().email(),
  phone: z.string().regex(new RegExp(/\+\d+/g), "Invalid phone number"),
  articles: z.array(createArticleSchema),
});

export type CreateDonationEntity = z.infer<typeof createDonationSchema>; 
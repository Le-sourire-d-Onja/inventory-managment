import { ArticleType } from "@/lib/generated/prisma";
import z from "zod";

export const createArticleSchema = z.object({
  type: z.nativeEnum(ArticleType),
  value: z.number().min(0),
  quantity: z.number().min(1),
});

export const createDonationSchema = z.object({
  name: z.string().nonempty(),
  description: z.string(),
  email: z.string().email().optional(),
  phone: z.string(),
  articles: z.array(createArticleSchema),
});

export type CreateDonationEntity = z.infer<typeof createDonationSchema>; 
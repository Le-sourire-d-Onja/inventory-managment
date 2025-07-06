import { ArticleType, DemandStatus, PackagingType } from "@/lib/generated/prisma";
import z from "zod";

export const createContentSchema = z.object({
  type: z.nativeEnum(ArticleType),
  quantity: z.number().min(1)
})

export const createContainerSchema = z.object({
  weight: z.number().min(0),
  volume: z.number().min(0),
  packaging: z.nativeEnum(PackagingType),
  contents: z.array(createContentSchema),
});

export const createDemandSchema = z.object({
  associationID: z.string().uuid(),
  status: z.nativeEnum(DemandStatus),
  containers: z.array(createContainerSchema),
});

export type CreateDemandEntity = z.infer<typeof createDemandSchema>; 
import { DemandStatus, PackagingType } from "@/lib/generated/prisma";
import z from "zod";

export const createContentSchema = z.object({
  type_id: z.string().uuid(),
  quantity: z.number().min(0)
})

export const createContainerSchema = z.object({
  packaging: z.nativeEnum(PackagingType),
  contents: z.array(createContentSchema),
});

export const createDemandSchema = z.object({
  association_id: z.string().uuid(),
  status: z.nativeEnum(DemandStatus),
  containers: z.array(createContainerSchema),
});

export type CreateDemandEntity = z.infer<typeof createDemandSchema>; 
import { DemandStatus, PackagingType } from "@/lib/generated/prisma";
import z from "zod";

export const createContentSchema = z.object({
  typeID: z.string().uuid(),
  quantity: z.number().min(0)
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
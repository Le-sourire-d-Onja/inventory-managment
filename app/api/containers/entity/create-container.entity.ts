import { PackagingType } from "@/lib/generated/prisma";
import z from "zod";
import { createContentSchema } from "./create-content.entity";

export const createContainerSchema = z.object({
  packaging: z.nativeEnum(PackagingType),
  contents: z.array(createContentSchema),
});

export type CreateContainer = z.infer<typeof createContainerSchema>;
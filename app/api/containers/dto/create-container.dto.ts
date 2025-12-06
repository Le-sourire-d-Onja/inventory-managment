import { PackagingType } from "@/lib/generated/prisma";
import z from "zod";
import { createContentDtoSchema } from "./create-content.dto";

export const createContainerDtoSchema = z.object({
  packaging: z.nativeEnum(PackagingType),
  contents: z.array(createContentDtoSchema),
});

export type CreateContainerDto = z.infer<typeof createContainerDtoSchema>;
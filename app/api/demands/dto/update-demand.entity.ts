import z from "zod";
import { createDemandDtoSchema } from "./create-demand.dto";
import { DemandStatus } from "@/lib/generated/prisma";
import { updateContainerDtoSchema } from "../../containers/dto/update-container.dto";



export const updateDemandDtoSchema = createDemandDtoSchema.extend({
  id: z.string().uuid().optional(),
  status: z.nativeEnum(DemandStatus),
  containers: z.array(updateContainerDtoSchema),
});

export type UpdateDemandDto = z.infer<typeof updateDemandDtoSchema>;
import z from "zod";
import { createDemandDtoSchema } from "./create-demand.dto";
import { updateContainerDtoSchema } from "../../containers/dto/update-container.dto";

export const updateDemandDtoSchema = createDemandDtoSchema.extend({
  id: z.string().uuid(),
  containers: z.array(updateContainerDtoSchema),
  document: z.string().nullable(),
}).partial();

export type UpdateDemandDto = z.infer<typeof updateDemandDtoSchema>;
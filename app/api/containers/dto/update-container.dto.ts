import z from "zod";
import { updateContentDtoSchema } from "./update-content.dto";
import { createContainerDtoSchema } from "./create-container.dto";


export const updateContainerDtoSchema = createContainerDtoSchema.extend({
  id: z.string().optional(),
  contents: z.array(updateContentDtoSchema),
  demand_id: z.string().uuid().nullable().optional(),
}).partial();

export type UpdateContainerDto = z.infer<typeof updateContainerDtoSchema>;
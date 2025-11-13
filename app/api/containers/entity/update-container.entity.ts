import z from "zod";
import { updateContentSchema } from "./update-content.entity";
import { createContainerSchema } from "./create-container.entity";


export const updateContainerSchema = createContainerSchema.extend({
  id: z.string().optional(),
  contents: z.array(updateContentSchema)
});

export type UpdateContainerEntity = z.infer<typeof updateContainerSchema>;
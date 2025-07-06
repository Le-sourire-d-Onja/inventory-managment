import z from "zod";
import { createContainerSchema, createContentSchema, createDemandSchema } from "./create-demand.entity";

export const updateContentSchema = createContentSchema.extend({
  id: z.string().uuid().optional(),
});

export const updateContainerSchema = createContainerSchema.extend({
  id: z.string().uuid().optional(),
  contents: z.array(updateContentSchema)
});

export const updateDemandSchema = createDemandSchema.extend({
  id: z.string().uuid().optional(),
  containers: z.array(updateContainerSchema),
});

export type UpdateDemandEntity = z.infer<typeof updateDemandSchema>; 
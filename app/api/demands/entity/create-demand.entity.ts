import z from "zod";
import { createContainerSchema } from "../../containers/entity/create-container.entity";

export const createDemandSchema = z.object({
  association_id: z.string().uuid(),
  containers: z.array(createContainerSchema),
});

export type CreateDemandEntity = z.infer<typeof createDemandSchema>;
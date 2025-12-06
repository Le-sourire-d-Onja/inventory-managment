import z from "zod";
import { createContainerDtoSchema } from "../../containers/dto/create-container.dto";

export const createDemandDtoSchema = z.object({
  association_id: z.string().uuid(),
  containers: z.array(createContainerDtoSchema),
});

export type CreateDemandDto = z.infer<typeof createDemandDtoSchema>;
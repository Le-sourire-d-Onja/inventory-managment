import z from "zod";
import { createContainerDtoSchema } from "../../containers/dto/create-container.dto";

export const createDemandDtoSchema = z.object({
  association_id: z.string().uuid(),
  containers: z.array(createContainerDtoSchema),
  linkedContainers: z.array(z.object({ id: z.string().nonempty() }))
});

export type CreateDemandDto = z.infer<typeof createDemandDtoSchema>;
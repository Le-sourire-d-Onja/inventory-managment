import z from "zod";
import { createDemandSchema } from "./create-demand.entity";
import { DemandStatus } from "@/lib/generated/prisma";
import { updateContainerSchema } from "../../containers/entity/update-container.entity";



export const updateDemandSchema = createDemandSchema.extend({
  id: z.string().uuid().optional(),
  status: z.nativeEnum(DemandStatus),
  containers: z.array(updateContainerSchema),
});

export type UpdateDemandEntity = z.infer<typeof updateDemandSchema>;
import z from "zod";
import { createAssociationSchema } from "./create-association.entity";



export const updateAssociationSchema = createAssociationSchema.extend({
  id: z.string().uuid().optional(),
});

export type UpdateAssociationEntity = z.infer<typeof updateAssociationSchema>; 
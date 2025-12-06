import z from "zod";
import { createAssociationDtoSchema } from "./create-association.dto";

export const updateAssociationDtoSchema = createAssociationDtoSchema.extend({
  id: z.string().uuid().optional(),
});

export type UpdateAssociationDto = z.infer<typeof updateAssociationDtoSchema>; 
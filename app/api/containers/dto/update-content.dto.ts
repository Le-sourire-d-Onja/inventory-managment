import z from "zod";
import { createContentDtoSchema } from "./create-content.dto";

export const updateContentDtoSchema = createContentDtoSchema.extend({
  id: z.string().uuid().optional(),
});
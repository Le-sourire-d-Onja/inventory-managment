import z from "zod";
import { createContentSchema } from "./create-content.entity";

export const updateContentSchema = createContentSchema.extend({
  id: z.string().uuid().optional(),
});
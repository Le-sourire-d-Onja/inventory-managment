import z from "zod";

export const createContentDtoSchema = z.object({
  type_id: z.string().uuid(),
  quantity: z.number().min(0)
})

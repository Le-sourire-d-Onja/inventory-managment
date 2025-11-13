import z from "zod";

export const createContentSchema = z.object({
  type_id: z.string().uuid(),
  quantity: z.number().min(0)
})

import z from "zod";

export const containerActionDtoSchema = z.object({
  id: z.string(),
  action: z.enum(["containerize", "distribute"]),
});

export type ContainerActionDto = z.infer<typeof containerActionDtoSchema>;

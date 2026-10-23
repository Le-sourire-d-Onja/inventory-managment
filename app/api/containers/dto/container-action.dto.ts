import z from "zod";

export const containerActionDtoSchema = z.object({
  id: z.string(),
  action: z.enum(["containerize", "distribute", "uncontainerize", "undistribute"]),
});

export type ContainerActionDto = z.infer<typeof containerActionDtoSchema>;

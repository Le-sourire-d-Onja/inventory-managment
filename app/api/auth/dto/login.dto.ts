import { z } from "zod";

export const loginDtoSchema = z.object({
  password: z.string().min(1, "Le mot de passe contient au moins un caractère."),
});

export type LoginDto = z.infer<typeof loginDtoSchema>;

import z from "zod";
import { AssociationType } from "@/lib/generated/prisma";

export const createAssociationDtoSchema = z.object({
  name: z.string().nonempty(),
  type: z.nativeEnum(AssociationType),
  person_in_charge: z.string().nonempty(),
  address: z.string().nonempty(),
  email: z.string().email(),
  phone: z.string().regex(new RegExp(/\+\d+/g), "Invalid phone number"),
  description: z.string(),
});

export type CreateAssociationDto = z.infer<typeof createAssociationDtoSchema>; 
import { AssociationType } from "@/lib/generated/prisma";
import { AssociationEntity } from "../entity/association.entity";


export class AssociationDto {
  id: string;
  name: string;
  type: AssociationType;
  person_in_charge: string;
  address: string;
  email: string
  phone: string;
  description: string;
  created_at: Date;
  updated_at: Date;

  constructor(id: string, name: string, type: AssociationType, person_in_charge: string, address: string, email: string, phone: string, description: string, created_at: Date, updated_at: Date) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.person_in_charge = person_in_charge;
    this.address = address;
    this.email = email;
    this.phone = phone;
    this.description = description;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  static typeTxt(type?: AssociationType) {
    switch (type) {
      case AssociationType.ASSOCIATION:
        return "Association";
      case AssociationType.CONGREGATION_RELIGIEUSE:
        return "Congregation religieuse";
      case AssociationType.ETABLISSEMENT:
        return "Établissement";
      case AssociationType.INDIVIDUEL:
        return "Individuel";
      case AssociationType.INSTITUTIONNEL_MINSAN:
        return "Institutionnel minsan";
      default:
        return "Inconnu";
    }
  }


  static parse(obj: AssociationEntity) {
    return new AssociationDto(obj.id, obj.name, obj.type, obj.person_in_charge, obj.address, obj.email, obj.phone, obj.description, new Date(obj.created_at), new Date(obj.updated_at));
  }

  static exportHeaders() {
    return ["Nom", "Type", "Personne en charge", "Adresse", "E-mail", "Téléphone", "Description", "Créée le"];
  }

  static exportValues(association: AssociationDto): string[] {
    return [
      association.name,
      AssociationDto.typeTxt(association.type),
      association.person_in_charge,
      association.address,
      association.email,
      association.phone,
      association.description,
      association.created_at.toLocaleDateString("fr-FR", { dateStyle: "short" })
    ];
  }

}
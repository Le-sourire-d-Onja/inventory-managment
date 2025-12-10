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

  exportValues(): string[] {
    return [
      this.name,
      AssociationDto.typeTxt(this.type),
      this.person_in_charge,
      this.address,
      this.email,
      this.phone,
      this.description,
      this.created_at.toLocaleDateString("fr-FR", { dateStyle: "short" })
    ];
  }

}
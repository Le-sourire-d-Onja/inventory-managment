import { AssociationType } from "@/lib/generated/prisma";


export class AssociationEntity {
  id: string;
  name: string;
  type: AssociationType;
  person_in_charge: string;
  address: string;
  email: string
  phone: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(id: string, name: string, type: AssociationType, person_in_charge: string, address: string, email: string, phone: string, description: string, createdAt: Date, updatedAt: Date) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.person_in_charge = person_in_charge;
    this.address = address;
    this.email = email;
    this.phone = phone;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
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
    return new AssociationEntity(obj.id, obj.name, obj.type, obj.person_in_charge, obj.address, obj.email, obj.phone, obj.description, new Date(obj.createdAt), new Date(obj.updatedAt));
  }
}
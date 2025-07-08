
import { DemandStatus, Association } from "@/lib/generated/prisma";
import { ContainerEntity } from "./container.entity";


export class DemandEntity {
  id: string;
  status: DemandStatus;
  containers: ContainerEntity[];
  association: Association;
  validatedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(id: string, status: DemandStatus, containers: ContainerEntity[], association: Association, validatedAt: Date | null, createdAt: Date, updatedAt: Date) {
    this.id = id;
    this.status = status;
    this.containers = containers;
    this.association = association;
    this.validatedAt = validatedAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static statusTxt(status?: DemandStatus) {
    switch (status) {
      case DemandStatus.IN_PROGRESS:
        return { color: "bg-orange-300", text: "En attente" };
      case DemandStatus.VALIDATED:
        return { color: "bg-green-300", text: "Validée" };
      default:
        return { color: "#ffffff", text: "Inconnu" };
    }
  }

  static parse(obj: DemandEntity) {
    return new DemandEntity(obj.id, obj.status, obj.containers.map((container) => ContainerEntity.parse(container)), obj.association, obj.validatedAt !== null ? new Date(obj.validatedAt) : null, new Date(obj.createdAt), new Date(obj.updatedAt));
  }
}
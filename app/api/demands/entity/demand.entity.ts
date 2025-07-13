
import { DemandStatus, Association, PackagingType } from "@/lib/generated/prisma";
import { ContainerEntity } from "./container.entity";
import { LabelInfos } from "@/lib/pdf";
import { UpdateDemandEntity } from "./update-demand.entity";


export class DemandEntity {
  id: string;
  status: DemandStatus;
  containers: ContainerEntity[];
  association: Association;
  validatedAt: Date | null;
  containerizedAt: Date | null;
  distributedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(id: string, status: DemandStatus, containers: ContainerEntity[], association: Association, validatedAt: Date | null, containerizedAt: Date | null, distributedAt: Date | null, createdAt: Date, updatedAt: Date) {
    this.id = id;
    this.status = status;
    this.containers = containers;
    this.association = association;
    this.validatedAt = validatedAt;
    this.containerizedAt = containerizedAt;
    this.distributedAt = distributedAt;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static packagingTxt(packaging?: PackagingType) {
    switch (packaging) {
      case PackagingType.CARDBOARD:
        return "Carton";
      case PackagingType.FILM:
        return "Filmé";
      case PackagingType.TIED_STRING:
        return "Ficelé";
      case PackagingType.NAKED:
        return "Nu";
      default:
        return "Inconnu";
    }
  }

  static statusTxt(status?: DemandStatus) {
    switch (status) {
      case DemandStatus.IN_PROGRESS:
        return { color: "bg-orange-300", text: "En attente" };
      case DemandStatus.VALIDATED:
        return { color: "bg-green-300", text: "Validée" };
      case DemandStatus.CONTAINERIZED:
        return { color: "bg-green-300", text: "Empotée" };
      case DemandStatus.DISTRIBUTED:
        return { color: "bg-green-300", text: "Distribuée" };
      default:
        return { color: "bg-white", text: "Inconnu" };
    }
  }

  static statusDate(demand?: DemandEntity): Date | null {
    switch (demand?.status) {
      case DemandStatus.IN_PROGRESS:
        return demand.createdAt;
      case DemandStatus.VALIDATED:
        return demand.validatedAt;
      case DemandStatus.CONTAINERIZED:
        return demand.containerizedAt;
      case DemandStatus.DISTRIBUTED:
        return demand.distributedAt;
      default:
        return null;
    }
  }

  static parse(obj: DemandEntity) {
    const validatedAt = !!obj.validatedAt ? new Date(obj.validatedAt) : null;
    const containerizedAt = !!obj.containerizedAt ? new Date(obj.containerizedAt) : null;
    const distributedAt = !!obj.distributedAt ? new Date(obj.distributedAt) : null;
    return new DemandEntity(obj.id, obj.status, obj.containers.map((container) => ContainerEntity.parse(container)), obj.association, validatedAt, containerizedAt, distributedAt, new Date(obj.createdAt), new Date(obj.updatedAt));
  }

  static toLabelInfos(obj: DemandEntity): LabelInfos[] {
    return obj.containers.map((container) => ({
      demandID: obj.id,
      containerID: container.id,
      associationName: obj.association.name,
      contents: container.contents.map((content) => ({
        name: content.type.name,
        quantity: content.quantity,
      }))
    }))
  }
}
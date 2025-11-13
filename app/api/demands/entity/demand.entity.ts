
import { DemandStatus, Association, PackagingType } from "@/lib/generated/prisma";
import { ContainerEntity } from "../../containers/entity/container.entity";
import { LabelInfos } from "@/lib/pdf";

export class DemandEntity {
  id: string;
  status: DemandStatus;
  containers: ContainerEntity[];
  association: Association;
  validated_at: Date | null;
  containerized_at: Date | null;
  distributed_at: Date | null;
  created_at: Date;
  updated_at: Date;

  constructor(id: string, status: DemandStatus, containers: ContainerEntity[], association: Association, validated_at: Date | null, containerized_at: Date | null, distributed_at: Date | null, created_at: Date, updated_at: Date) {
    this.id = id;
    this.status = status;
    this.containers = containers;
    this.association = association;
    this.validated_at = validated_at;
    this.containerized_at = containerized_at;
    this.distributed_at = distributed_at;
    this.created_at = created_at;
    this.updated_at = updated_at;
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
        return demand.created_at;
      case DemandStatus.VALIDATED:
        return demand.validated_at;
      case DemandStatus.CONTAINERIZED:
        return demand.containerized_at;
      case DemandStatus.DISTRIBUTED:
        return demand.distributed_at;
      default:
        return null;
    }
  }

  static parse(obj: DemandEntity) {
    const validated_at = !!obj.validated_at ? new Date(obj.validated_at) : null;
    const containerized_at = !!obj.containerized_at ? new Date(obj.containerized_at) : null;
    const distributed_at = !!obj.distributed_at ? new Date(obj.distributed_at) : null;
    return new DemandEntity(obj.id, obj.status, obj.containers.map((container) => ContainerEntity.parse(container)), obj.association, validated_at, containerized_at, distributed_at, new Date(obj.created_at), new Date(obj.updated_at));
  }

  static toLabelInfos(obj: DemandEntity): LabelInfos[] {
    return obj.containers.map((container) => ({
      demand_id: obj.id,
      container_id: container.id,
      associationName: obj.association.name,
      contents: container.contents.map((content) => ({
        name: content.type.name,
        quantity: content.quantity,
      }))
    }))
  }
}
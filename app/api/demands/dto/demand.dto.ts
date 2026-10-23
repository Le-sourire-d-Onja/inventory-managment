import { PackagingType } from "@/lib/generated/prisma";
import { NEUTRAL_STATUS, STATUS_TOKENS, StatusToken } from "@/lib/status-tokens";
import { ContainerDto } from "../../containers/dto/container.dto";
import { LabelInfos } from "@/lib/pdf";
import { DemandEntity } from "../entity/demand.entity";
import { AssociationDto } from "../../associations/dto/association.dto";
import FilesService from "../../files/files.service";

/**
 * Statut de la Demande, entièrement dérivé de ses Contenants : jamais stocké.
 * `IN_PROGRESS` tant que tous les Contenants n'ont pas atteint l'Empotage,
 * `CONTAINERIZED` dès que tous l'ont atteint, `DISTRIBUTED` dès que tous sont
 * distribués.
 */
export type DemandStatus = "IN_PROGRESS" | "CONTAINERIZED" | "DISTRIBUTED";

export const DEMAND_STATUSES: DemandStatus[] = ["IN_PROGRESS", "CONTAINERIZED", "DISTRIBUTED"];

export class DemandDto {
  id: string;
  status: DemandStatus;
  containers: ContainerDto[];
  association: AssociationDto;
  documentUrl: string | null;
  created_at: Date;
  updated_at: Date;

  constructor(
    id: string,
    status: DemandStatus,
    containers: ContainerDto[],
    association: AssociationDto,
    documentUrl: string | null,
    created_at: Date,
    updated_at: Date,
  ) {
    this.id = id;
    this.status = status;
    this.containers = containers;
    this.association = association;
    this.documentUrl = documentUrl;
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

  static statusData(status: DemandStatus): {
    key: StatusToken;
    color: string;
    text: string;
  };
  static statusData(status?: DemandStatus): {
    key: StatusToken | null;
    color: string;
    text: string;
  };
  static statusData(status?: DemandStatus) {
    switch (status) {
      case "IN_PROGRESS":
        return demandStatusData("waiting", "En attente");
      case "CONTAINERIZED":
        return demandStatusData("containerized", "Empotée");
      case "DISTRIBUTED":
        return demandStatusData("distributed", "Distribuée");
      default:
        return { key: null, color: NEUTRAL_STATUS.badgeClass, text: "Inconnu" };
    }
  }

  static statusDate(demand?: DemandDto): Date | null {
    switch (demand?.status) {
      case "IN_PROGRESS":
        return demand.created_at;
      case "CONTAINERIZED":
        // A Container that only carries a distribution date has still passed
        // through empotage, so it counts toward the Empotée milestone date.
        return latestDate(
          demand.containers.map((container) => container.containerized_at ?? container.distributed_at),
        );
      case "DISTRIBUTED":
        return latestDate(demand.containers.map((container) => container.distributed_at));
      default:
        return null;
    }
  }

  /**
   * Dérive le Statut de la Demande de ses Contenants (règle « tous ») : une
   * Demande à 0 Contenant reste En attente. Un Contenant Distribué compte comme
   * ayant atteint l'Empotage.
   */
  static deriveStatus(
    containers: Pick<ContainerDto, "containerized_at" | "distributed_at">[],
  ): DemandStatus {
    if (containers.length === 0) return "IN_PROGRESS";
    if (containers.every((container) => container.distributed_at)) return "DISTRIBUTED";
    if (containers.every((container) => container.containerized_at || container.distributed_at)) {
      return "CONTAINERIZED";
    }
    return "IN_PROGRESS";
  }

  static parse(obj: DemandEntity) {
    const containers = obj.containers.map((container) => ContainerDto.parse(container));
    return new DemandDto(
      obj.id,
      DemandDto.deriveStatus(containers),
      containers,
      AssociationDto.parse(obj.association),
      null,
      new Date(obj.created_at),
      new Date(obj.updated_at),
    );
  }

  static async parseWithDocumentUrl(
    obj: DemandEntity & { document?: string | null; documentUrl?: string | null },
  ): Promise<DemandDto> {
    const containers = obj.containers.map((container) => ContainerDto.parse(container));
    const documentUrl = obj.documentUrl ?? (obj.document ? await FilesService.getDownloadUrl(obj.document) : null);
    return new DemandDto(
      obj.id,
      DemandDto.deriveStatus(containers),
      containers,
      AssociationDto.parse(obj.association),
      documentUrl,
      new Date(obj.created_at),
      new Date(obj.updated_at),
    );
  }

  static toLabelInfos(obj: DemandDto): LabelInfos[] {
    return obj.containers.map((container) => ({
      demand_id: obj.id,
      container_id: container.id,
      associationName: obj.association.name,
      contents: container.contents.map((content) => ({
        name: content.type.name,
        quantity: content.quantity,
      })),
    }));
  }

  static exportValues(demand: DemandDto): string[] {
    return [
      demand.association.name,
      DemandDto.statusData(demand.status).text,
      demand.documentUrl ?? "",
      demand.containers.map((container) => `N°${container.id}`).join(", "),
    ];
  }

  static exportHeaders(): string[] {
    return ["Association", "Statut", "Document", "Contenants"];
  }
}

/** Associe un libellé de Demande au badge de son token partagé. */
function demandStatusData(key: StatusToken, text: string) {
  return { key, color: STATUS_TOKENS[key].badgeClass, text };
}

/** La plus récente des dates non nulles, ou `null` si aucune ne l'est. */
function latestDate(dates: (Date | null)[]): Date | null {
  const timestamps = dates.filter((date): date is Date => date !== null).map((date) => date.getTime());
  if (timestamps.length === 0) return null;
  return new Date(Math.max(...timestamps));
}

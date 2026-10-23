import { PackagingType } from "@/lib/generated/prisma";
import { STATUS_TOKENS, StatusToken } from "@/lib/status-tokens";
import { ContentDto } from "./content.dto";
import { AssociationDto } from "../../associations/dto/association.dto";
import { ContainerEntity } from "../entity/container.entity";
import { DemandDto } from "../../demands/dto/demand.dto";

export interface ContainerState {
  /** Clé stable du token de statut (`waiting`, `assigned`, …). */
  key: StatusToken;
  /** Classe de badge associée au token. */
  color: string;
  text: string;
}

/** Libellés genrés des Statuts de Contenant, portés par le DTO. */
const CONTAINER_STATE_LABELS: Record<StatusToken, string> = {
  waiting: "En attente",
  assigned: "Attribué",
  containerized: "Empoté",
  distributed: "Distribué",
};

export class ContainerDto {
  id: string;
  weight: number;
  volume: number;
  value: number;
  packaging: PackagingType;
  contents: ContentDto[];
  association: AssociationDto | null;
  demand_id: string | null;
  containerized_at: Date | null;
  distributed_at: Date | null;
  state: ContainerState;

  constructor(
    id: string,
    weight: number,
    volume: number,
    value: number,
    packaging: PackagingType,
    contents: ContentDto[],
    association: AssociationDto | null,
    demand_id: string | null,
    containerized_at: Date | null,
    distributed_at: Date | null,
  ) {
    this.id = id;
    this.weight = weight;
    this.volume = volume;
    this.value = value;
    this.packaging = packaging;
    this.contents = contents;
    this.association = association;
    this.demand_id = demand_id;
    this.containerized_at = containerized_at;
    this.distributed_at = distributed_at;
    this.state = ContainerDto.containerState(this);
  }

  /** Projection d'une clé de token sur son Statut de Contenant complet. */
  static stateData(key: StatusToken): ContainerState {
    return {
      key,
      color: STATUS_TOKENS[key].badgeClass,
      text: CONTAINER_STATE_LABELS[key],
    };
  }

  static containerState(
    container: Pick<
      ContainerDto,
      "association" | "demand_id" | "containerized_at" | "distributed_at"
    >,
  ): ContainerState {
    if (container.distributed_at) {
      return ContainerDto.stateData("distributed");
    }
    if (container.containerized_at) {
      return ContainerDto.stateData("containerized");
    }
    if (container.demand_id || container.association) {
      return ContainerDto.stateData("assigned");
    }
    return ContainerDto.stateData("waiting");
  }

  static parse(obj: ContainerEntity) {
    return new ContainerDto(
      obj.id,
      obj.weight,
      obj.volume,
      obj.value,
      obj.packaging,
      obj.contents.map((content) => ContentDto.parse(content)),
      obj.demand?.association ?? null,
      obj.demand_id,
      obj.containerized_at ? new Date(obj.containerized_at) : null,
      obj.distributed_at ? new Date(obj.distributed_at) : null,
    );
  }

  static exportHeaders() {
    return ["Identifiant", "Poids (kg)", "Volume (m³)", "Valeur (€)", "Type d'empaquetage", "Contenu", "Statut", "Association"];
  }

  static exportValues(container: ContainerDto): (string | number)[] {
    return [
      `N°${container.id}`,
      container.weight,
      container.volume,
      container.value,
      DemandDto.packagingTxt(container.packaging),
      container.contents.map((content) => content.type.name + " (" + content.quantity + ")").join(", "),
      ContainerDto.containerState(container).text,
      container.association?.name ?? "",
    ];
  }
}

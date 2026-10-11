import { PackagingType } from "@/lib/generated/prisma";
import { ContentDto } from "./content.dto";
import { AssociationDto } from "../../associations/dto/association.dto";
import { ContainerEntity } from "../entity/container.entity";
import { DemandDto } from "../../demands/dto/demand.dto";

export interface ContainerState {
  color: string;
  text: string;
}

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

  static containerState(
    container: Pick<
      ContainerDto,
      "association" | "demand_id" | "containerized_at" | "distributed_at"
    >,
  ): ContainerState {
    if (container.distributed_at) {
      return { color: "bg-purple-300", text: "Distribué" };
    }
    if (container.containerized_at) {
      return { color: "bg-blue-300", text: "Empoté" };
    }
    if (container.demand_id || container.association) {
      return { color: "bg-green-300", text: "Attribué" };
    }
    return { color: "bg-orange-300", text: "En attente" };
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
      obj.containerized_at,
      obj.distributed_at,
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

import { PackagingType } from "@/lib/generated/prisma";
import { ContentDto } from "./content.dto";
import { AssociationDto } from "../../associations/dto/association.dto";
import { ContainerEntity } from "../entity/container.entity";

export class ContainerDto {
  id: string;
  weight: number;
  volume: number;
  packaging: PackagingType;
  contents: ContentDto[];
  association: AssociationDto | null;

  constructor(id: string, weight: number, volume: number, packaging: PackagingType, contents: ContentDto[], association: AssociationDto | null) {
    this.id = id;
    this.weight = weight;
    this.volume = volume;
    this.packaging = packaging;
    this.contents = contents;
    this.association = association;
  }

  static containerState(container: Pick<ContainerDto, "association">) {
    if (container.association) {
      return { color: "bg-green-300", text: "Attribué" };
    }
    return { color: "bg-orange-300", text: "En attente" };
  }

  static parse(obj: ContainerEntity) {
    return new ContainerDto(obj.id, obj.weight, obj.volume, obj.packaging, obj.contents.map((content) => ContentDto.parse(content)), obj.demand?.association ?? null);
  }
}
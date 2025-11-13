import { PackagingType } from "@/lib/generated/prisma";
import { ContentEntity } from "./content.entity";

export class ContainerEntity {
  id: string;
  weight: number;
  volume: number;
  packaging: PackagingType;
  contents: ContentEntity[];

  constructor(id: string, weight: number, volume: number, packaging: PackagingType, contents: ContentEntity[]) {
    this.id = id;
    this.weight = weight;
    this.volume = volume;
    this.packaging = packaging;
    this.contents = contents;
  }

  static parse(obj: ContainerEntity) {
    return new ContainerEntity(obj.id, obj.weight, obj.volume, obj.packaging, obj.contents.map((content) => ContentEntity.parse(content)));
  }
}
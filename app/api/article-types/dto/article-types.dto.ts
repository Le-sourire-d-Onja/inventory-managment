import { ArticleTypeEntity } from "../entity/article-type.entity";

export class ArticleTypeDto {
  id: string;
  name: string;
  weight: number;
  volume: number;


  constructor(id: string, name: string, weight: number, volume: number) {
    this.id = id;
    this.name = name;
    this.weight = weight;
    this.volume = volume;
  }

  static parse(obj: ArticleTypeEntity) {
    return new ArticleTypeDto(obj.id, obj.name, obj.weight, obj.volume);
  }

  static exportValues(articleType: ArticleTypeDto): string[] {
    return [articleType.name, articleType.weight.toFixed(2), articleType.volume.toFixed(2)];
  }

  static exportHeaders(): string[] {
    return ["Nom", "Poids (kg)", "Volume (m³)"];
  }
}
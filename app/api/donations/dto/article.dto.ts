import { ArticleTypeDto } from "../../article-types/dto/article-types.dto";
import { ArticleEntity } from "../entity/article.entity";

export class ArticleDto {
  id: string;
  type: ArticleTypeDto;
  quantity: number;

  constructor(id: string, type: ArticleTypeDto, quantity: number) {
    this.id = id;
    this.type = type;
    this.quantity = quantity;
  }

  static parse(obj: ArticleEntity) {
    return new ArticleDto(obj.id, obj.type, obj.quantity);
  }

  static exportValues(article: ArticleDto): string[] {
    return [article.type.name, article.quantity.toFixed(2), (article.quantity * article.type.weight).toFixed(2), (article.quantity * article.type.volume).toFixed(2)];
  }

  static exportHeaders(): string[] {
    return ["Nom", "Quantité", "Poids (kg)", "Volume (m³)"];
  }

}
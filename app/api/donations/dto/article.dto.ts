import { ArticleType } from "@/lib/generated/prisma";
import { ArticleEntity } from "../entity/article.entity";

export class ArticleDto {
  id: string;
  type: ArticleType;
  quantity: number;

  constructor(id: string, type: ArticleType, quantity: number) {
    this.id = id;
    this.type = type;
    this.quantity = quantity;
  }

  static parse(obj: ArticleEntity) {
    return new ArticleDto(obj.id, obj.type, obj.quantity);
  }
}
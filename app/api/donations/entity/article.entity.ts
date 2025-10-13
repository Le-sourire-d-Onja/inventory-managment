import { ArticleType } from "@/lib/generated/prisma";

export class ArticleEntity {
  id: string;
  type: ArticleType;
  quantity: number;

  constructor(id: string, type: ArticleType, quantity: number) {
    this.id = id;
    this.type = type;
    this.quantity = quantity;
  }

  static parse(obj: ArticleEntity) {
    return new ArticleEntity(obj.id, obj.type, obj.quantity);
  }
}
import { ArticleType } from "@/lib/generated/prisma";

export class ArticleEntity {
  id: string;
  type: ArticleType;
  price: number;
  quantity: number;

  constructor(id: string, type: ArticleType, price: number, quantity: number) {
    this.id = id;
    this.type = type;
    this.price = price;
    this.quantity = quantity;
  }

  static parse(obj: ArticleEntity) {
    return new ArticleEntity(obj.id, obj.type, obj.price, obj.quantity);
  }
}
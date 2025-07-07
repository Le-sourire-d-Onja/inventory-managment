import { ArticleType } from "@/lib/generated/prisma";


export class StockEntity {
  type: ArticleType;
  quantity: number;

  constructor(type: ArticleType, quantity: number) {
    this.type = type;
    this.quantity = quantity;
  }

  static parse(obj: StockEntity) {
    return new StockEntity(obj.type, obj.quantity);
  }
}
import { ArticleType } from "@/lib/generated/prisma";

export class ArticleEntity {
  id: string;
  type: ArticleType;
  value: number;
  quantity: number;

  constructor(id: string, type: ArticleType, value: number, quantity: number) {
    this.id = id;
    this.type = type;
    this.value = value;
    this.quantity = quantity;
  }
}
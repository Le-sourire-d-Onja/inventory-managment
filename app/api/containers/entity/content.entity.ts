import { ArticleType } from "@/lib/generated/prisma";

export class ContentEntity {
  id: string;
  type: ArticleType;
  quantity: number;

  constructor(id: string, type: ArticleType, quantity: number) {
    this.id = id;
    this.type = type;
    this.quantity = quantity;
  }

  static parse(obj: ContentEntity) {
    return new ContentEntity(obj.id, obj.type, obj.quantity);
  }
}
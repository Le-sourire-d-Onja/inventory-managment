import { ArticleType, Content } from "@/lib/generated/prisma";

export class ContentDto {
  id: string;
  type: ArticleType;
  quantity: number;

  constructor(id: string, type: ArticleType, quantity: number) {
    this.id = id;
    this.type = type;
    this.quantity = quantity;
  }

  static parse(obj: Content & { type: ArticleType }) {
    return new ContentDto(obj.id, obj.type, obj.quantity);
  }
}
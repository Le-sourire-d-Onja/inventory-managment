import { ArticleTypeDto } from "../../article-types/dto/article-types.dto";
import { ContentEntity } from "../entity/content.entity";

export class ContentDto {
  id: string;
  type: ArticleTypeDto;
  quantity: number;

  constructor(id: string, type: ArticleTypeDto, quantity: number) {
    this.id = id;
    this.type = type;
    this.quantity = quantity;
  }

  static parse(obj: ContentEntity) {
    return new ContentDto(obj.id, obj.type, obj.quantity);
  }
}
import { ArticleTypeDto } from "../../article-types/dto/article-types.dto";

export class StockEntity {
  type: ArticleTypeDto;
  quantity: number;
  volume: number;
  weight: number;

  constructor(type: ArticleTypeDto, quantity: number, volume: number, weight: number ) {
    this.type = type;
    this.quantity = quantity;
    this.volume = volume;
    this.weight = weight;
  }

  static parse(obj: StockEntity) {
    return new StockEntity(obj.type, obj.quantity, obj.volume, obj.weight);
  }
}


export class StockEntityShort {
  type: string;
  quantity: number;
  volume: number;
  weight: number;

  constructor(type: string, quantity: number, volume: number, weight: number) {
    this.type = type;
    this.quantity = quantity;
    this.volume = volume;
    this.weight = weight;
  }

  static parse(obj: StockEntity) {
    return new StockEntityShort(obj.type.name, obj.quantity, obj.volume, obj.weight);
  }
}
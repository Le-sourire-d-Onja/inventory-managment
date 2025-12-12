import { ArticleTypeDto } from "../../article-types/dto/article-types.dto";
import { StockEntity } from "../entity/stock.entity";

export class StockDto {
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
    return new StockDto(obj.type, obj._sum.quantity, obj._sum.volume, obj._sum.weight);
  }

  static exportValues(stock: StockDto): string[] {
    return [stock.type.name, stock.quantity.toFixed(2), stock.volume.toFixed(2), stock.weight.toFixed(2)];
  }

  static exportHeaders(): string[] {
    return ["Article", "Quantité", "Poids (kg)", "Volume (m³)"];
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

  static parse(obj: StockDto) {
    return new StockEntityShort(obj.type.name, obj.quantity, obj.volume, obj.weight);
  }
}
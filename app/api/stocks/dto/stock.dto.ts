import { ArticleTypeDto } from "../../article-types/dto/article-types.dto";
import { StockEntity } from "../entity/stock.entity";

export class StockDto {
  type: ArticleTypeDto;
  quantity: number;
  volume: number;
  weight: number;
  value: number;

  constructor(type: ArticleTypeDto, quantity: number, volume: number, weight: number, value: number) {
    this.type = type;
    this.quantity = quantity;
    this.volume = volume;
    this.weight = weight;
    this.value = value;
  }

  static parse(obj: StockEntity) {
    return new StockDto(obj.type, obj.quantity, obj.volume, obj.weight, obj.value);
  }

  static exportValues(stock: StockDto): (string | number)[] {
    return [stock.type.name, stock.quantity, stock.weight, stock.volume, stock.value];
  }

  static exportHeaders(): string[] {
    return ["Article", "Quantité", "Poids (kg)", "Volume (m³)", "Valeur (€)"];
  }
}

export class StockEntityShort {
  type: string;
  quantity: number;
  volume: number;
  weight: number;
  value: number;

  constructor(type: string, quantity: number, volume: number, weight: number, value: number) {
    this.type = type;
    this.quantity = quantity;
    this.volume = volume;
    this.weight = weight;
    this.value = value;
  }

  static parse(obj: StockDto) {
    return new StockEntityShort(obj.type.name, obj.quantity, obj.volume, obj.weight, obj.value);
  }
}


export class ArticleTypeEntity {
  id: string;
  name: string;
  weight: number;
  volume: number;
  price: number;


  constructor(id: string, name: string, weight: number, volume: number, price: number) {
    this.id = id;
    this.name = name;
    this.weight = weight;
    this.volume = volume;
    this.price = price;
  }

  static parse(obj: ArticleTypeEntity) {
    return new ArticleTypeEntity(obj.id, obj.name, obj.weight, obj.volume, obj.price);
  }
}
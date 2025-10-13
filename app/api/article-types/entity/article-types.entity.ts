
export class ArticleTypeEntity {
  id: string;
  name: string;
  weight: number;
  volume: number;


  constructor(id: string, name: string, weight: number, volume: number) {
    this.id = id;
    this.name = name;
    this.weight = weight;
    this.volume = volume;
  }

  static parse(obj: ArticleTypeEntity) {
    return new ArticleTypeEntity(obj.id, obj.name, obj.weight, obj.volume);
  }
}
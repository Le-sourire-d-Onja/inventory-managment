
export class ArticleTypeEntity {
  id: string;
  name: string;

  constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  static parse(obj: ArticleTypeEntity) {
    return new ArticleTypeEntity(obj.id, obj.name);
  }
}
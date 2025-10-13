import { ArticleEntity } from "./article.entity";


export class DonationEntity {
  id: string;
  description: string | null;
  articles: ArticleEntity[];
  created_at: Date;
  updated_at: Date;

  constructor(id: string, articles: ArticleEntity[], created_at: Date, updated_at: Date, description: string | null) {
    this.id = id;
    this.description = description;
    this.articles = articles;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  static parse(obj: DonationEntity) {
    return new DonationEntity(
      obj.id,
      obj.articles.map((article) => ArticleEntity.parse(article)),
      new Date(obj.created_at),
      new Date(obj.updated_at),
      obj.description,
    );
  }
}
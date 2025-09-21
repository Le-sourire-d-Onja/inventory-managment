import { ArticleEntity } from "./article.entity";


export class DonationEntity {
  id: string;
  description: string | null;
  articles: ArticleEntity[];
  createdAt: Date;
  updatedAt: Date;

  constructor(id: string, articles: ArticleEntity[], createdAt: Date, updatedAt: Date, description: string | null) {
    this.id = id;
    this.description = description;
    this.articles = articles;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static parse(obj: DonationEntity) {
    return new DonationEntity(
      obj.id,
      obj.articles.map((article) => ArticleEntity.parse(article)),
      new Date(obj.createdAt),
      new Date(obj.updatedAt),
      obj.description,
    );
  }
}
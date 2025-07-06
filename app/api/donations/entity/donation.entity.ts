import { ArticleEntity } from "./article.entity";


export class DonationEntity {
  id: string;
  name: string;
  description: string | null;
  email: string | null;
  phone: string | null;
  articles: ArticleEntity[];
  createdAt: Date;
  updatedAt: Date;

  constructor(id: string, name: string, articles: ArticleEntity[], createdAt: Date, updatedAt: Date, description: string | null, email: string | null, phone: string | null) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.email = email;
    this.phone = phone;
    this.articles = articles;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static parse(obj: DonationEntity) {
    return new DonationEntity(obj.id, obj.name, obj.articles.map((article) => ArticleEntity.parse(article)), new Date(obj.createdAt), new Date(obj.updatedAt), obj.description, obj.email, obj.phone);
  }
}
import { DonationEntity } from "../entity/donation.entity";
import { ArticleDto } from "./article.dto";


export class DonationDto {
  id: string;
  description: string | null;
  articles: ArticleDto[];
  created_at: Date;
  updated_at: Date;

  constructor(id: string, articles: ArticleDto[], created_at: Date, updated_at: Date, description: string | null) {
    this.id = id;
    this.description = description;
    this.articles = articles;
    this.created_at = created_at;
    this.updated_at = updated_at;
  }

  static parse(obj: DonationEntity) {
    return new DonationDto(
      obj.id,
      obj.articles.map((article) => ArticleDto.parse(article)),
      new Date(obj.created_at),
      new Date(obj.updated_at),
      obj.description,
    );
  }

  static exportValues(donation: DonationDto): string[] {
    return [donation.articles.map((article) => article.type.name).join(", ") , donation.description ?? ""];
  }

  static exportHeaders(): string[] {
    return ["Articles", "Description"];
  }
}
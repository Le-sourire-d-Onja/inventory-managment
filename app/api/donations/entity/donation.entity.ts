import { Donation } from "@/lib/generated/prisma";
import { ArticleEntity, articleInclude } from "./article.entity";

export type DonationEntity = Donation & { articles: ArticleEntity[] }

export const donationInclude = {
  articles: {
    include: articleInclude
  }
}
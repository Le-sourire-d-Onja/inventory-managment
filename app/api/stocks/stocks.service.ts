import { ArticleType, DemandStatus } from "@/lib/generated/prisma";
import { prisma } from "../prisma";
import { StockEntity } from "./entity/stock.entity";

export default class StocksService {

  static async findOne(types: ArticleType[]) {
    // Get the sum of the quantity of all article by types
    const articles = await prisma.article.groupBy({
      by: ["type"],
      where: {
        type: { in: types },
      },
      _sum: {
        quantity: true,
      },
    });
    // Get the sum of the quantity of all content by types
    const contents = await prisma.content.groupBy({
      by: ['type'],
      where: {
        type: {
          in: types
        },
        container: {
          demand: {
            status: DemandStatus.DONE,
          }
        }
      },
      _sum: {
        quantity: true
      },
    });
    // Remove the content quantity from the article quantity to get the stock quantity
    const stocks = articles.map((article) => {
      const content = contents.find((content) => content.type === article.type);
      if (!content)
        return article;
      return { ...article, _sum: { quantity: article._sum.quantity - content._sum.quantity } }
    })
    return stocks.map((stock) => new StockEntity(stock.type, stock._sum.quantity));
  }

}
import { DemandStatus } from "@/lib/generated/prisma";
import { prisma } from "../prisma";
import { StockEntity } from "./entity/stock.entity";
import ArticleTypesService from "../article-types/article-types.service";

export default class StocksService {

  static async findAll() {
    // Get the sum of the quantity of all article by types
    const articles = await prisma.article.groupBy({
      by: ["typeID"],
      _sum: {
        quantity: true,
      },
    });

    // Get the sum of the quantity of all content by types
    const contents = await prisma.content.groupBy({
      by: ['typeID'],
      where: {
        container: {
          demand: {
            status: DemandStatus.VALIDATED,
          }
        }
      },
      _sum: {
        quantity: true
      },
    });

    const articleTypes = await ArticleTypesService.findAll();

    // Remove the content quantity from the article quantity to get the stock quantity
    const stocks = articles.map((article) => {
      const content = contents.find((content) => content.typeID === article.typeID);
      const articleType = articleTypes.find((articleType) => article.typeID === articleType.id)!;
      return { type: articleType, _sum: { quantity: (article._sum.quantity ?? 0) - (content?._sum.quantity ?? 0) } }
    })
    return stocks.map((stock) => new StockEntity(stock.type, stock._sum.quantity ?? 0));
  }

}
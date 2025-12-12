import { DemandStatus } from "@/lib/generated/prisma";
import { prisma } from "../prisma";
import { StockDto } from "./dto/stock.dto";
import ArticleTypesService from "../article-types/article-types.service";

export default class StocksService {

  static async findAll(type: "stock" | "container" | "demand"): Promise<StockDto[]> {
    // Get the sum of the quantity of all article by types
    const articles = await prisma.article.groupBy({
      by: ["type_id"],
      _sum: {
        quantity: true,
      },
    });

    // Get the sum of the quantity of all content by types
    const contents = await prisma.content.groupBy({
      by: ['type_id'],
      where: {
        container: {
          demand: {
            status: type === "demand" ? DemandStatus.IN_PROGRESS : DemandStatus.VALIDATED,
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
      const content = contents.find((content) => content.type_id === article.type_id);
      const articleType = articleTypes.find((articleType) => article.type_id === articleType.id)!;
      let quantity =  (article._sum.quantity ?? 0) - (content?._sum.quantity ?? 0);
      if (type === "container") {
        quantity = content?._sum.quantity ?? 0;
      }
      const volume = (articleType.volume ?? 0) * quantity;
      const weight = (articleType.weight ?? 0) * quantity;
      return { type: articleType, _sum: { quantity, volume, weight } }
    })
    return stocks.map(({ type, _sum }) => StockDto.parse({ type, ..._sum }));
  }

}
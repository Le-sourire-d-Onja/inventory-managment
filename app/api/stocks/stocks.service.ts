import { prisma } from "../prisma";
import { StockDto } from "./dto/stock.dto";
import ArticleTypesService from "../article-types/article-types.service";

export default class StocksService {
  static async findAll(type: "stock" | "container"): Promise<StockDto[]> {
    const articleTypes = await ArticleTypesService.findAll();

    // "container" (Stock empoté): the Contents held by Containers at status
    // Empoté, i.e. containerized_at set and distributed_at null. The exported
    // rows are exactly the article types those Contents carry: a type held
    // only inside an Empoté Container shows up even if it was never part of a
    // Donation, and no empty row (0 everywhere) is emitted.
    if (type === "container") {
      const contents = await prisma.content.groupBy({
        by: ["type_id"],
        where: {
          container: {
            containerized_at: { not: null },
            distributed_at: null,
          },
        },
        _sum: {
          quantity: true,
        },
      });

      return contents
        .map((content) => {
          const articleType = articleTypes.find(
            (articleType) => articleType.id === content.type_id,
          );
          if (!articleType) return null;
          const quantity = content._sum.quantity ?? 0;
          return StockDto.parse({
            type: articleType,
            quantity,
            volume: (articleType.volume ?? 0) * quantity,
            weight: (articleType.weight ?? 0) * quantity,
            value: (articleType.value ?? 0) * quantity,
          });
        })
        .filter((stock): stock is StockDto => stock !== null);
    }

    // Get the sum of the quantity of all article by types
    const articles = await prisma.article.groupBy({
      by: ["type_id"],
      _sum: {
        quantity: true,
      },
    });

    // Get the sum of the quantity of all content by types.
    //
    // "stock": a Content leaves the stock as soon as its Container is attributed
    // (non-null demand_id); a free Container (null demand_id) does not decrement
    // anything.
    const contents = await prisma.content.groupBy({
      by: ["type_id"],
      where: { container: { demand_id: { not: null } } },
      _sum: {
        quantity: true,
      },
    });

    // Remove the content quantity from the article quantity to get the stock quantity
    const stocks = articles.map((article) => {
      const content = contents.find((content) => content.type_id === article.type_id);
      const articleType = articleTypes.find((articleType) => article.type_id === articleType.id)!;
      const quantity = (article._sum.quantity ?? 0) - (content?._sum.quantity ?? 0);
      const volume = (articleType.volume ?? 0) * quantity;
      const weight = (articleType.weight ?? 0) * quantity;
      const value = (articleType.value ?? 0) * quantity;
      return { type: articleType, _sum: { quantity, volume, weight, value } };
    });
    return stocks.map(({ type, _sum }) => StockDto.parse({ type, ..._sum }));
  }
}

import { DemandStatus } from "@/lib/generated/prisma";
import { prisma } from "../prisma";
import { StockDto } from "./dto/stock.dto";
import ArticleTypesService from "../article-types/article-types.service";

/**
 * Raised when an attribution would push a stock quantity below zero. Route
 * handlers translate it into a 4xx so callers can correct the attribution
 * instead of seeing a server error.
 */
export class InsufficientStockError extends Error {
  constructor(
    public readonly typeId: string,
    public readonly available: number,
    public readonly requested: number,
  ) {
    super("Stock insuffisant");
    this.name = "InsufficientStockError";
  }
}

export default class StocksService {

  static async findAll(type: "stock" | "container" | "demand"): Promise<StockDto[]> {
    // Get the sum of the quantity of all article by types
    const articles = await prisma.article.groupBy({
      by: ["type_id"],
      _sum: {
        quantity: true,
      },
    });

    // Get the sum of the quantity of all content by types.
    //
    // A Content leaves the stock as soon as its Container is attributed
    // (non-null demand_id) whatever the status of the Demand. A free Container
    // (null demand_id) does not decrement anything. The "demand" mode keeps its
    // historical meaning of "content of the demands still in progress".
    const contents = await prisma.content.groupBy({
      by: ["type_id"],
      where:
        type === "demand"
          ? { container: { demand: { status: DemandStatus.IN_PROGRESS } } }
          : { container: { demand_id: { not: null } } },
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
      const value = (articleType.value ?? 0) * quantity;
      return { type: articleType, _sum: { quantity, volume, weight, value } }
    })
    return stocks.map(({ type, _sum }) => StockDto.parse({ type, ..._sum }));
  }

  /**
   * Current available stock per article type, i.e. the `"stock"` aggregation
   * which already excludes every attributed Container (including the one of the
   * Demand being checked).
   */
  static async stockByType(): Promise<Map<string, number>> {
    const stocks = await StocksService.findAll("stock");
    return new Map(stocks.map((stock) => [stock.type.id, stock.quantity]));
  }

  /**
   * Quantity of each article type currently consumed by a Demand, i.e. the sum
   * of the Contents of its attributed Containers.
   */
  static async demandConsumption(demandId: string): Promise<Map<string, number>> {
    const contents = await prisma.content.groupBy({
      by: ["type_id"],
      where: { container: { demand_id: demandId } },
      _sum: { quantity: true },
    });
    return new Map(
      contents.map((content) => [content.type_id, content._sum.quantity ?? 0]),
    );
  }

  /**
   * Aggregates the Contents described by a set of Container DTOs, together with
   * the Contents of the free Containers being linked, into a quantity per
   * article type. This is the consumption a Demand is about to hold.
   */
  static async consumptionOf(
    containers: { contents?: { type_id: string; quantity: number }[] }[],
    linkedContainerIds: string[] = [],
  ): Promise<Map<string, number>> {
    const totals = new Map<string, number>();
    const add = (typeId: string, quantity: number) =>
      totals.set(typeId, (totals.get(typeId) ?? 0) + quantity);

    for (const container of containers) {
      for (const content of container.contents ?? []) {
        add(content.type_id, content.quantity);
      }
    }

    if (linkedContainerIds.length > 0) {
      const linkedContents = await prisma.content.findMany({
        where: { container_id: { in: linkedContainerIds } },
      });
      for (const content of linkedContents) {
        add(content.type_id, content.quantity);
      }
    }

    return totals;
  }

  /**
   * Ensures attributing `requested` (the Demand's consumption after the
   * mutation) does not exceed the stock available to that Demand, defined as
   * the current stock plus the Demand's own current consumption `own`. Because
   * the current stock already excludes the Demand's attributed Containers,
   * adding `own` back lets a Demand re-use what it already holds without
   * blocking itself.
   *
   * @throws InsufficientStockError when a quantity would go negative.
   */
  static assertAvailability(
    stock: Map<string, number>,
    own: Map<string, number>,
    requested: Map<string, number>,
  ): void {
    for (const [typeId, quantity] of requested) {
      if (quantity <= 0) continue;
      const available = (stock.get(typeId) ?? 0) + (own.get(typeId) ?? 0);
      if (quantity > available) {
        throw new InsufficientStockError(typeId, available, quantity);
      }
    }
  }

}

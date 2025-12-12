import { ArticleTypeDto } from "../../article-types/dto/article-types.dto";


export type StockEntity = {
  type: ArticleTypeDto,
  quantity: number,
  volume: number,
  weight: number
};

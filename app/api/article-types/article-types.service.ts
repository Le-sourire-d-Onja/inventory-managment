import { prisma } from "../../../lib/prisma";
import { ArticleTypeEntity } from "./entity/article-types.entity";
import { CreateArticleTypeEntity } from "./entity/create-article-type.entity";
import { UpdateArticleTypeEntity } from "./entity/update-article-type.entity";

export default class ArticleTypesService {

  /**
   * This function is used to retrieve all the associations of the database
   * 
   * @returns All the association entity of the database
   */
  static async findAll(): Promise<ArticleTypeEntity[]> {
    const articleTypes = await prisma.articleType.findMany({});
    return articleTypes.map((articleType) => ArticleTypeEntity.parse(articleType));
  }

  /**
   * This function is used to create a articleType in the database
   * 
   * @param data The entity to create the articleType
   * @returns The created articleType
   */
  static async create(data: CreateArticleTypeEntity): Promise<ArticleTypeEntity> {
    const articleType = await prisma.articleType.create({
      data: data,
    });
    return ArticleTypeEntity.parse(articleType);
  }

  /**
 * This function is used to update a articleType in the database
 * 
 * @param createArticleType The entity to update the articleType, the id to update
 * the articleType is included in the object
 * @returns The updated articleType
 */
  static async update(data: UpdateArticleTypeEntity): Promise<ArticleTypeEntity> {
    const articleType = await prisma.articleType.update({
      where: { id: data.id },
      data: data,
    });
    return ArticleTypeEntity.parse(articleType);
  }

  /**
   * This function is used to delete a articleType in the database
   * 
   * @param id The articleType id to be deleted
   * @returns The deleted articleType  
   */
  static async delete(id: string): Promise<ArticleTypeEntity> {
    const articleType = await prisma.articleType.delete({
      where: { id: id },
    });
    return ArticleTypeEntity.parse(articleType);
  }

}
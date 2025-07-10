import { ArticleType, DemandStatus } from "@/lib/generated/prisma";
import { prisma } from "../prisma";
import { CreateDemandEntity } from "./entity/create-demand.entity";
import { DemandEntity } from "./entity/demand.entity";
import { UpdateDemandEntity } from "./entity/update-demand.entity";
import ArticleTypesService from "../article-types/article-types.service";

export default class DemandsService {

  /**
   * This function will compute all weight and volume of all
   * contents and total them for the container
   * 
   * @param container The container to reduce all weight and volume
   * @param articleTypes All the types available in the container
   * @returns [weight, volume] of the container
   */
  static computeContainerWeightAndVolume(
    container: { contents: { typeID: string, quantity: number }[] },
    articleTypes: ArticleType[]
  ): [number, number] {
    return container.contents.reduce(
      ([weightTotal, volumeTotal], content) => {
        const articleType = articleTypes.find((type) => type.id === content.typeID);
        const weight = articleType?.weight ?? 0;
        const volume = articleType?.volume ?? 0;

        return [
          weightTotal + content.quantity * weight,
          volumeTotal + content.quantity * volume,
        ];
      }, [0, 0]);
  }


  /**
   * This function is used to retrieve one the demand from the database
   * 
   * @returns All the demand entity of the database
   */
  static async findOne(id: string): Promise<DemandEntity> {
    const demand = await prisma.demand.findUnique({
      where: { id: id },
      include: {
        association: true,
        containers: {
          include: {
            contents: {
              include: {
                type: true,
              }
            },
          }
        }
      },
    });
    if (!demand)
      throw new Error("Not found");
    return DemandEntity.parse(demand);
  }

  /**
   * This function is used to retrieve all the demands from the database
   * 
   * @returns All the demand entity of the database
   */
  static async findAll(): Promise<DemandEntity[]> {
    const demands = await prisma.demand.findMany({
      include: {
        association: true,
        containers: {
          include: {
            contents: {
              include: {
                type: true,
              }
            },
          }
        }
      },
    });
    return demands.map((demand) => DemandEntity.parse(
      demand
    ));
  }

  /**
   * This function is used to create a demand in the database
   * 
   * @param data The entity to create the demand
   * @returns The created demand
   */
  static async create(data: CreateDemandEntity): Promise<DemandEntity> {

    const articleTypes = await ArticleTypesService.findAll();

    const demand = await prisma.demand.create({
      data: {
        associationID: data.associationID,
        status: data.status,
        containers: {
          create: data.containers.map(container => {
            const [weight, volume] = DemandsService.computeContainerWeightAndVolume(container, articleTypes);
            return {
              weight: weight,
              volume: volume,
              packaging: container.packaging,
              contents: {
                create: container.contents.map(content => ({
                  type: {
                    connect: { id: content.typeID },
                  },
                  quantity: content.quantity,
                }))
              }
            };
          })
        }
      },
      include: {
        association: true,
        containers: {
          include: {
            contents: {
              include: {
                type: true,
              }
            },
          }
        }
      }
    });
    return DemandEntity.parse(demand);
  }

  /**
 * This function is used to update a demand in the database
 * 
 * @param data The entity to update the demand, the id to update
 * the demand is included in the object
 * @returns The updated demand
 */
  static async update(data: UpdateDemandEntity): Promise<DemandEntity> {

    const validatedAt = data.status === DemandStatus.VALIDATED ? new Date() : undefined;

    const articleTypes = await ArticleTypesService.findAll();

    const demand = await prisma.demand.update({
      where: { id: data.id },
      data: {
        status: data.status,
        validatedAt: validatedAt,
        associationID: data.associationID,
        containers: {
          deleteMany: {},
          create: data.containers.map(container => {
            const [weight, volume] = DemandsService.computeContainerWeightAndVolume(container, articleTypes);
            return {
              weight: weight,
              volume: volume,
              packaging: container.packaging,
              contents: {
                create: container.contents.map(content => ({
                  type: {
                    connect: { id: content.typeID },
                  },
                  quantity: content.quantity,
                }))
              }
            };
          })
        }
      },
      include: {
        association: true,
        containers: {
          include: {
            contents: {
              include: {
                type: true,
              }
            },
          }
        }
      }
    });
    return DemandEntity.parse(demand);
  }

  static async delete(id: string): Promise<DemandEntity> {
    const demand = await prisma.demand.delete({
      where: { id: id },
      include: {
        association: true,
        containers: {
          include: {
            contents: {
              include: {
                type: true,
              }
            }
          }
        }
      }
    });
    return DemandEntity.parse(demand);

  }
}
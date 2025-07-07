import { prisma } from "../prisma";
import { CreateDemandEntity } from "./entity/create-demand.entity";
import { DemandEntity } from "./entity/demand.entity";
import { UpdateDemandEntity } from "./entity/update-demand.entity";

export default class DemandsService {

  /**
   * This function is used to retrieve all the demands of the database
   * 
   * @returns All the demand entity of the database
   */
  static async findAll(): Promise<DemandEntity[]> {
    const demands = await prisma.demand.findMany({
      include: {
        association: true,
        containers: {
          include: {
            contents: true,
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
    const demand = await prisma.demand.create({
      data: {
        associationID: data.associationID,
        status: data.status,
        containers: {
          create: data.containers.map(container => ({
            weight: container.weight,
            volume: container.volume,
            packaging: container.packaging,
            contents: {
              create: container.contents.map(content => ({
                type: content.type,
                quantity: content.quantity,
              }))
            }
          }))
        }
      },
      include: {
        association: true,
        containers: {
          include: {
            contents: true,
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
    const demand = await prisma.demand.update({
      where: { id: data.id },
      data: {
        status: data.status,
        associationID: data.associationID,
        containers: {
          deleteMany: {}, // on les supprime tous pour repartir proprement (autre stratégie possible ci-dessous)
          create: data.containers.map(container => ({
            weight: container.weight,
            volume: container.volume,
            packaging: container.packaging,
            contents: {
              create: container.contents.map(content => ({
                type: content.type,
                quantity: content.quantity,
              }))
            }
          }))
        }
      },
      include: {
        association: true,
        containers: {
          include: {
            contents: true,
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
            contents: true
          }
        }
      }
    });
    return DemandEntity.parse(demand);

  }
}
import { DemandStatus, PackagingType } from "@/lib/generated/prisma";
import { prisma } from "../prisma";
import { CreateDemandDto } from "./dto/create-demand.dto";
import { DemandDto } from "./dto/demand.dto";
import { UpdateDemandDto } from "./dto/update-demand.entity";
import ArticleTypesService from "../article-types/article-types.service";
import ContainersService from "../containers/containers.service";
import { demandInclude } from "./entity/demand.entity";

export default class DemandsService {

  /**
   * This function is used to retrieve one demand from the database
   *
   * @param id The id of the demand
   * @returns The demand entity of the database
   * @throws An error if the container doesn't exists
   */
  static async findOne(id: string): Promise<DemandDto> {
    const demand = await prisma.demand.findUnique({
      where: { id: id },
      include: demandInclude,
    });
    if (!demand)
      throw new Error("Not found");
    return DemandDto.parse(demand);
  }

  /**
   * This function is used to retrieve all demands from the database
   * 
   * @returns All the demand entity of the database
   */
  static async findAll(): Promise<DemandDto[]> {
    const demands = await prisma.demand.findMany({
      include: demandInclude,
    });
    return demands.map((demand) => DemandDto.parse(
      demand
    ));
  }

  /**
   * This function is used to create a demand in the database
   * 
   * @param data The entity to create the demand
   * @returns The created demand
   */
  static async create(data: CreateDemandDto): Promise<DemandDto> {

    const articleTypes = await ArticleTypesService.findAll();

    let nbContainers = await ContainersService.findNbContainers();

    const demand = await prisma.demand.create({
      data: {
        association_id: data.association_id,
        status: DemandStatus.IN_PROGRESS,
        containers: {
          create: data.containers.map((container) => {
            const [weight, volume] = ContainersService.findContainerWeightAndVolume(articleTypes, container.contents);
            return {
              id: ContainersService.formatContainerID(nbContainers++),
              weight: weight ?? 0,
              volume: volume ?? 0,
              packaging: container.packaging,
              contents: {
                create: container.contents.map(content => ({
                  type: {
                    connect: { id: content.type_id },
                  },
                  quantity: content.quantity,
                }))
              }
            };
          }),
          connect: data.linkedContainers
        }
      },
      include: demandInclude
    });
    return DemandDto.parse(demand);
  }

  /**
   * This function is used to create a container in the database
   * that will not be link to a demand
   * 
   * @param data The entity to create the container
   * @returns The created container
   */


  /**
 * This function is used to update a demand in the database
 *
 * @param data The entity to update the demand, the id to update
 * the demand is included in the object
 * @returns The updated demand
 */
  static async update(data: UpdateDemandDto): Promise<DemandDto> {

    const validated_at = data.status === DemandStatus.VALIDATED ? new Date() : undefined;

    const articleTypes = await ArticleTypesService.findAll();

    let nbContainers = await ContainersService.findNbContainers();

    const demand = await prisma.demand.update({
      where: { id: data.id },
      data: {
        status: data.status,
        validated_at: validated_at,
        association_id: data.association_id,
        containers: {
          deleteMany: {},
          create: data.containers?.map(container => {
            const [weight, volume] = ContainersService.findContainerWeightAndVolume(articleTypes, container.contents);
            return {
              id: container.id ?? ContainersService.formatContainerID(nbContainers++),
              weight: weight ?? 0,
              volume: volume ?? 0,
              packaging: container.packaging ?? PackagingType.NONE,
              contents: {
                create: container.contents?.map(content => ({
                  type: {
                    connect: { id: content.type_id },
                  },
                  quantity: content.quantity,
                }))
              }
            };
          }),
          connect: data.linkedContainers,
        }
      },
      include: demandInclude
    });
    return DemandDto.parse(demand);
  }

  /**
   * This function is used to delete a demand from the database
   *
   * @param id The id of the demand
   * @returns The demand entity of the database
   */
  static async delete(id: string): Promise<DemandDto> {
    const demand = await prisma.demand.delete({
      where: { id: id },
      include: demandInclude
    });
    return DemandDto.parse(demand);
  }
}
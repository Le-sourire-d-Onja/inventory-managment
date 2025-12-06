import { ArticleType } from "@/lib/generated/prisma";
import { prisma } from "../prisma";
import { ContainerDto } from "./dto/container.dto";
import { CreateContainerDto } from "./dto/create-container.dto";
import { UpdateContainerDto } from "./dto/update-container.dto";
import ArticleTypesService from "../article-types/article-types.service";
import { containerInclude } from "./entity/container.entity";


export default class ContainersService {

   /**
     * This function returns the number of containers created in the current year
     * from the database
     *
     * @returns The number of containers
     */
    static async findNbContainers() {
      const startOfYear = new Date(new Date().getFullYear(), 0, 1);
      const nbContainers = await prisma.container.count({
        where: { OR: [{ demand: { created_at: { gte: startOfYear, } } }, { demand_id: null }] },
      });
      return nbContainers
    }

    /**
     * This function format the id of a container from the number
     * of container in the database
     *
     * format: YYNbContainer
     *
     * @param nbContainers The number of container in the database
     * @returns the formatted id
     */
    static formatContainerID(nbContainers: number) {
      const year = new Date().getFullYear() % 100;
      return `${year}${String(nbContainers).padStart(4, '0')}`
    }

    /**
     * This function will compute all weight and volume of all
     * contents and total them for the container
     *
     * @param container The container to reduce all weight and volume
     * @param articleTypes All the types available in the container
     * @returns [weight, volume] of the container
     */
    static findContainerWeightAndVolume(
      container: { contents: { type_id: string, quantity: number }[] },
      articleTypes: ArticleType[]
    ): [number, number] {
      return container.contents.reduce(
        ([weightTotal, volumeTotal], content) => {
          const articleType = articleTypes.find((type) => type.id === content.type_id);
          const weight = articleType?.weight ?? 0;
          const volume = articleType?.volume ?? 0;

          return [
            weightTotal + content.quantity * weight,
            volumeTotal + content.quantity * volume,
          ];
      }, [0, 0]);
  }

  /**
   * This function is used to retrieve one container from the database
   *
   * @param id The id of the container
   * @returns The container entity of the database
   * @throws An error if the container doesn't exists
   */
  static async findOne(id: string): Promise<ContainerDto> {
    const container = await prisma.container.findUnique({
      where: { id: id },
      include: containerInclude,
    });
    if (!container)
      throw new Error("Not found");
    return ContainerDto.parse(container);
  }

  /**
   * This function is used to retrieve all containers from the database
   *
   * @param inDemand Know if the container belongs to a demand
   * @returns All the container entity of the database
   */
  static async findAll(inDemand: boolean): Promise<ContainerDto[]> {
    const containers = await prisma.container.findMany({
      where: !inDemand ? { demand_id: null } : {},
      include: containerInclude,
    });
    return containers.map((container) => ContainerDto.parse(container));
  }

  /**
   * This function is used to create a container in the database
   *
   * @param data The entity to create the container
   * @returns The created container
   */
  static async create(data: CreateContainerDto): Promise<ContainerDto> {
    const articleTypes = await ArticleTypesService.findAll();

    const nbContainers = await ContainersService.findNbContainers();

    console.log(nbContainers)

    const [weight, volume] = ContainersService.findContainerWeightAndVolume(data, articleTypes);
    const container = await prisma.container.create({
      data: {
        id: ContainersService.formatContainerID(nbContainers + 1),
        weight: weight,
        volume: volume,
        packaging: data.packaging,
        contents: {
          create: data.contents.map(content => ({
            type: {
              connect: { id: content.type_id },
            },
            quantity: content.quantity,
          }))
        }
      },
      include: containerInclude,
    });
    return ContainerDto.parse(container);
  }

  /**
   * This function is used to update a container in the database
   *
   * @param data The entity to update the demand, the id to update
   * the demand is included in the object
   * @returns The updated demand
   */
  static async update(data: UpdateContainerDto): Promise<ContainerDto> {
    const articleTypes = await ArticleTypesService.findAll();

    const [weight, volume] = ContainersService.findContainerWeightAndVolume(data, articleTypes);

    const container = await prisma.container.update({
      where: { id: data.id },
      data: {
        weight: weight,
        volume: volume,
        packaging: data.packaging,
        contents: {
          create: data.contents.map(content => ({
            type: {
              connect: { id: content.type_id },
            },
            quantity: content.quantity,
          }))
        }
      },
      include: containerInclude,
    });
    return ContainerDto.parse(container);  }

  /**
   * This function is used to delete a container from the database
   *
   * @param id The id of the container
   * @returns The container entity of the database
   */
  static async delete(id: string): Promise<ContainerDto> {
    const container = await prisma.container.delete({
      where: { id: id },
      include: containerInclude
    });
    return ContainerDto.parse(container);
  }


}
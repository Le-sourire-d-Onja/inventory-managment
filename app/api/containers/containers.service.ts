import { prisma } from "../prisma";
import { ContainerDto } from "./dto/container.dto";
import { CreateContainerDto } from "./dto/create-container.dto";
import { UpdateContainerDto } from "./dto/update-container.dto";
import { ContainerActionDto } from "./dto/container-action.dto";
import ArticleTypesService from "../article-types/article-types.service";
import { containerInclude } from "./entity/container.entity";
import { ArticleTypeDto } from "../article-types/dto/article-types.dto";

/**
 * Raised when a Container transition is not allowed from its current state
 * (illegal transition or backward move). The route maps it to a 4xx response.
 */
export class ContainerTransitionError extends Error {}

/**
 * Raised when deleting a Container would erase a physical act: an Empoté or
 * Distribué Container must not be deleted, by symmetry with the detach guard.
 * The route maps it to a 4xx response.
 */
export class ContainerDeletionError extends Error {}

/**
 * Raised when an edition would break the coherence of a Container's life
 * cycle: a dated Container (Empoté or Distribué) cannot be re-linked to
 * another Demand, nor detached, through the generic update. Cancelling the act
 * is the only way back. The route maps it to a 409.
 */
export class ContainerUpdateError extends Error {
  constructor(message = "Impossible de modifier le rattachement d'un contenant empoté ou distribué") {
    super(message);
    this.name = "ContainerUpdateError";
  }
}

export default class ContainersService {
  /**
   * This function returns the next container number for the current year
   * from the database
   *
   * @returns The next container number
   */
  static async findNextContainerNumber() {
    const yearPrefix = String(new Date().getFullYear() % 100);

    // Container ids are formatted `YYNNNN`: the year prefix identifies the
    // current year's containers regardless of which Demand they are attached
    // to. Filtering instead on the Demand's creation year would hide a
    // current-year container still attached to an older Demand, and the next
    // number would then collide with it.
    const containers = await prisma.container.findMany({
      where: { id: { startsWith: yearPrefix } },
      select: { id: true },
    });

    if (containers.length === 0) {
      return 1;
    }

    const lastNumber = containers.reduce((max, container) => {
      const number = parseInt(container.id.substring(yearPrefix.length), 10);
      return Number.isNaN(number) ? max : Math.max(max, number);
    }, 0);

    return lastNumber + 1;
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
    return `${year}${String(nbContainers).padStart(4, "0")}`;
  }

  /**
   * This function will compute all weight, volume and value of all
   * contents and total them for the container
   *
   * @param container The container to reduce all weight, volume and value
   * @param articleTypes All the types available in the container
   * @returns [weight, volume, value] of the container
   */
  static findContainerWeightVolumeAndValue(
    articleTypes: ArticleTypeDto[],
    contents?: { type_id: string; quantity: number }[],
  ): [number?, number?, number?] {
    if (!contents) return [undefined, undefined, undefined];
    return contents?.reduce(
      ([weightTotal, volumeTotal, valueTotal], content) => {
        const articleType = articleTypes.find((type) => type.id === content.type_id);
        const weight = articleType?.weight ?? 0;
        const volume = articleType?.volume ?? 0;
        const value = articleType?.value ?? 0;

        return [
          weightTotal + content.quantity * weight,
          volumeTotal + content.quantity * volume,
          valueTotal + content.quantity * value,
        ];
      },
      [0, 0, 0],
    );
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
    if (!container) throw new Error("Not found");
    return ContainerDto.parse(container);
  }

  /**
   * This function is used to retrieve containers from the database
   *
   * @param scope "free" returns only containers not linked to a demand,
   * "all" returns every container
   * @returns The matching container entities of the database
   */
  static async findByScope(scope: "free" | "all"): Promise<ContainerDto[]> {
    const containers = await prisma.container.findMany({
      where: scope === "free" ? { demand_id: null } : {},
      include: containerInclude,
      orderBy: { id: "asc" },
    });
    return containers.map((container) => ContainerDto.parse(container));
  }

  /**
   * This function is used to recompute the stored weight, volume and value
   * of every container that contains an article of the given type.
   *
   * It must be called whenever an article type is updated, because the
   * container aggregates are denormalized snapshots derived from the article
   * type and would otherwise become stale.
   *
   * @param typeId The id of the updated article type
   */
  static async recomputeAggregatesForArticleType(typeId: string): Promise<void> {
    const containers = await prisma.container.findMany({
      where: { contents: { some: { type_id: typeId } } },
      include: { contents: true },
    });
    if (containers.length === 0) return;

    const articleTypes = await ArticleTypesService.findAll();

    await prisma.$transaction(
      containers.map((container) => {
        const [weight, volume, value] = ContainersService.findContainerWeightVolumeAndValue(
          articleTypes,
          container.contents,
        );
        return prisma.container.update({
          where: { id: container.id },
          data: {
            weight: weight ?? 0,
            volume: volume ?? 0,
            value: value ?? 0,
          },
        });
      }),
    );
  }

  /**
   * This function is used to create a container in the database
   *
   * @param data The entity to create the container
   * @returns The created container
   */
  static async create(data: CreateContainerDto): Promise<ContainerDto> {
    const articleTypes = await ArticleTypesService.findAll();

    const nextNumber = await ContainersService.findNextContainerNumber();

    const [weight, volume, value] = ContainersService.findContainerWeightVolumeAndValue(articleTypes, data.contents);

    const container = await prisma.container.create({
      data: {
        id: ContainersService.formatContainerID(nextNumber),
        weight: weight ?? 0,
        volume: volume ?? 0,
        value: value ?? 0,
        packaging: data.packaging,
        contents: {
          create: data.contents.map((content) => ({
            type: {
              connect: { id: content.type_id },
            },
            quantity: content.quantity,
          })),
        },
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
    const existing = await prisma.container.findUnique({
      where: { id: data.id },
    });
    if (!existing) throw new Error("Not found");

    // The demand link of a dated Container is part of the act: it may only
    // change after an explicit cancellation, never through a generic edit.
    const dated = !!existing.containerized_at || !!existing.distributed_at;
    if (
      dated &&
      data.demand_id !== undefined &&
      data.demand_id !== existing.demand_id
    ) {
      throw new ContainerUpdateError();
    }

    // `contents` absent means "leave the Contents alone"; an explicit array
    // (even empty) replaces them and recomputes the aggregates.
    const contentsProvided = data.contents !== undefined;
    const articleTypes = await ArticleTypesService.findAll();
    const [weight, volume, value] = contentsProvided
      ? ContainersService.findContainerWeightVolumeAndValue(articleTypes, data.contents)
      : [undefined, undefined, undefined];

    const container = await prisma.container.update({
      where: { id: data.id },
      data: {
        packaging: data.packaging,
        demand_id: data.demand_id,
        ...(contentsProvided
          ? {
              weight: weight ?? 0,
              volume: volume ?? 0,
              value: value ?? 0,
              contents: {
                deleteMany: {},
                create: (data.contents ?? []).map((content) => ({
                  type: {
                    connect: { id: content.type_id },
                  },
                  quantity: content.quantity,
                })),
              },
            }
          : {}),
      },
      include: containerInclude,
    });
    return ContainerDto.parse(container);
  }

  /**
   * This function is used to move a container's lifecycle one step at a time
   * with server-side dates. Forward moves stamp the date; cancellations erase
   * only the date of the act being undone and never touch the demand link, the
   * Contents, the aggregates or the stock.
   *
   * @param data The id of the container and the action to perform
   * @returns The updated container entity
   * @throws Error if the container doesn't exist
   * @throws ContainerTransitionError if the transition is not allowed
   */
  static async transition(data: ContainerActionDto): Promise<ContainerDto> {
    const container = await prisma.container.findUnique({
      where: { id: data.id },
      include: containerInclude,
    });
    if (!container) throw new Error("Not found");

    const containerized = !!container.containerized_at;
    const distributed = !!container.distributed_at;
    let update: { containerized_at?: Date | null; distributed_at?: Date | null };

    switch (data.action) {
      case "containerize":
        if (!container.demand_id || containerized || distributed) {
          throw new ContainerTransitionError("Cannot containerize");
        }
        update = { containerized_at: new Date() };
        break;
      case "distribute":
        if (!containerized || distributed) {
          throw new ContainerTransitionError("Cannot distribute");
        }
        update = { distributed_at: new Date() };
        break;
      case "uncontainerize":
        // One step back only: a Distribué Container must be undistributed
        // first, so this requires an empotage date and no distribution date.
        if (!containerized || distributed) {
          throw new ContainerTransitionError("Cannot uncontainerize");
        }
        update = { containerized_at: null };
        break;
      case "undistribute":
        if (!distributed) {
          throw new ContainerTransitionError("Cannot undistribute");
        }
        update = { distributed_at: null };
        break;
    }

    const updated = await prisma.container.update({
      where: { id: data.id },
      data: update,
      include: containerInclude,
    });
    return ContainerDto.parse(updated);
  }

  /**
   * This function is used to delete a container from the database. A Container
   * that is already Empoté or Distribué cannot be deleted: doing so would erase
   * a physical act and falsify the aggregate status of its Demand.
   *
   * @param id The id of the container
   * @returns The container entity of the database
   * @throws Error if the container doesn't exist
   * @throws ContainerDeletionError if the container is Empoté or Distribué
   */
  static async delete(id: string): Promise<ContainerDto> {
    const existing = await prisma.container.findUnique({ where: { id: id } });
    if (!existing) throw new Error("Not found");
    if (existing.containerized_at || existing.distributed_at) {
      throw new ContainerDeletionError("Impossible de supprimer un contenant empoté ou distribué");
    }

    const container = await prisma.container.delete({
      where: { id: id },
      include: containerInclude,
    });
    return ContainerDto.parse(container);
  }
}

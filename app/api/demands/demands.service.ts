import { DemandStatus, PackagingType } from "@/lib/generated/prisma";
import { prisma } from "../prisma";
import { CreateDemandDto } from "./dto/create-demand.dto";
import { DemandDto } from "./dto/demand.dto";
import { UpdateDemandDto } from "./dto/update-demand.entity";
import ArticleTypesService from "../article-types/article-types.service";
import ContainersService from "../containers/containers.service";
import StocksService from "../stocks/stocks.service";
import { demandInclude } from "./entity/demand.entity";
import FilesService from "../files/files.service";

/**
 * Raised when a Demand update would detach a Container that is already Empoté
 * or Distribué (dates set). Detaching must never erase an empotage or a
 * distribution, so the route maps this to a 4xx.
 */
export class ContainerDetachError extends Error {
  constructor(public readonly containerId: string) {
    super("Impossible de détacher un contenant empoté ou distribué");
    this.name = "ContainerDetachError";
  }
}

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
    if (!demand) throw new Error("Not found");
    return DemandDto.parseWithDocumentUrl(demand);
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
    return Promise.all(demands.map((demand) => DemandDto.parseWithDocumentUrl(demand)));
  }

  /**
   * This function is used to create a demand in the database
   *
   * @param data The entity to create the demand
   * @param file Optional file to upload as document
   * @returns The created demand
   */
  static async create(data: CreateDemandDto, file?: File | null): Promise<DemandDto> {
    const articleTypes = await ArticleTypesService.findAll();

    let nextContainerNumber = await ContainersService.findNextContainerNumber();

    let documentKey: string | undefined;
    if (file && file.size > 0) {
      const bucket = process.env.S3_BUCKET;
      if (bucket) {
        documentKey = await FilesService.upload(file, bucket);
      }
    }

    const demand = await prisma.demand.create({
      data: {
        association_id: data.association_id,
        status: DemandStatus.IN_PROGRESS,
        document: documentKey,
        containers: {
          create: data.containers.map((container) => {
            const [weight, volume, value] = ContainersService.findContainerWeightVolumeAndValue(articleTypes, container.contents);
            return {
              id: ContainersService.formatContainerID(nextContainerNumber++),
              weight: weight ?? 0,
              volume: volume ?? 0,
              value: value ?? 0,
              packaging: container.packaging,
              contents: {
                create: container.contents.map((content) => ({
                  type: {
                    connect: { id: content.type_id },
                  },
                  quantity: content.quantity,
                })),
              },
            };
          }),
          connect: data.linkedContainers,
        },
      },
      include: demandInclude,
    });
    return DemandDto.parseWithDocumentUrl(demand);
  }

  /**
   * This function is used to update a demand in the database
   *
   * @param data The entity to update the demand, the id to update
   * the demand is included in the object
   * @param file Optional file to upload as document
   * @returns The updated demand
   */
  static async update(data: UpdateDemandDto, file?: File | null): Promise<DemandDto> {
    if (!data.id) throw new Error("Demand id is required");

    const demandId = data.id;
    const validated_at = data.status === DemandStatus.VALIDATED ? new Date() : undefined;

    const articleTypes = await ArticleTypesService.findAll();

    // A partial update that carries neither `containers` nor `linkedContainers`
    // (e.g. `{ id, document: null }`) must not touch the Demand's Containers at
    // all: only an explicit `containers: []` means "detach all". Reconciling in
    // that case would detach every Container and could 409 on a document-only
    // edit, which is independent of the Container list.
    const reconcileContainers =
      data.containers !== undefined || data.linkedContainers !== undefined;

    // Containers currently linked to this Demand and the incoming Containers
    // that already exist. A missing incoming Container is detached rather than
    // deleted; an existing one is updated in place, preserving its identity,
    // its Contents and its empotage/distribution dates.
    const currentContainers = reconcileContainers
      ? await prisma.container.findMany({
          where: { demand_id: demandId },
          include: { contents: true },
        })
      : [];
    const incoming = data.containers ?? [];
    const linkedIds = (data.linkedContainers ?? []).map((container) => container.id);
    const incomingIds = incoming
      .map((container) => container.id)
      .filter((id): id is string => !!id);

    const existingIncoming =
      incomingIds.length > 0
        ? await prisma.container.findMany({
            where: { id: { in: incomingIds } },
            include: { contents: true },
          })
        : [];
    const existingById = new Map(existingIncoming.map((container) => [container.id, container]));

    const toDetach = currentContainers.filter(
      (container) => !incomingIds.includes(container.id) && !linkedIds.includes(container.id),
    );
    for (const container of toDetach) {
      // Detaching an Empoté or Distribué Container would erase a physical act.
      if (container.containerized_at || container.distributed_at) {
        throw new ContainerDetachError(container.id);
      }
    }

    // Stock availability is only checked when validating a Demand. The stock
    // already excludes every attributed Container, so the Demand's own
    // consumption is added back to avoid blocking itself; only a genuine
    // over-allocation (e.g. a concurrent Demand) is refused. The requested
    // consumption is the incoming Contents (plus the linked Containers) when
    // the update also touches them, and the Demand's current consumption
    // otherwise.
    if (data.status === DemandStatus.VALIDATED) {
      const stock = await StocksService.stockByType();
      const ownConsumption = await StocksService.demandConsumption(demandId);
      const requested = reconcileContainers
        ? await StocksService.consumptionOf(
            incoming.map((container) => ({
              contents:
                container.contents ??
                (container.id
                  ? existingById
                      .get(container.id)
                      ?.contents.map((content) => ({ type_id: content.type_id, quantity: content.quantity }))
                  : undefined),
            })),
            linkedIds,
          )
        : new Map(ownConsumption);
      StocksService.assertAvailability(stock, ownConsumption, requested);
    }

    let nextContainerNumber = await ContainersService.findNextContainerNumber();

    let documentKey: string | null | undefined;
    let oldDocumentKey: string | undefined;
    if (file && file.size > 0) {
      const existingDemand = await prisma.demand.findUnique({
        where: { id: demandId },
        select: { document: true },
      });
      oldDocumentKey = existingDemand?.document ?? undefined;
      const bucket = process.env.S3_BUCKET;
      if (bucket) {
        documentKey = await FilesService.upload(file, bucket);
      }
    } else if (data.document !== undefined) {
      const existingDemand = await prisma.demand.findUnique({
        where: { id: demandId },
        select: { document: true },
      });
      if (data.document === null && existingDemand?.document) {
        oldDocumentKey = existingDemand.document;
      }
      documentKey = data.document;
    }

    const demand = await prisma.$transaction(async (tx) => {
      // Detach the removed Containers: keep the rows and their Contents, return
      // them En attente and clear the empotage/distribution trace.
      for (const container of toDetach) {
        await tx.container.update({
          where: { id: container.id },
          data: { demand_id: null, containerized_at: null, distributed_at: null },
        });
      }

      for (const container of incoming) {
        const [weight, volume, value] = ContainersService.findContainerWeightVolumeAndValue(
          articleTypes,
          container.contents,
        );
        const existing = container.id ? existingById.get(container.id) : undefined;

        if (existing) {
          // Update in place: reconcile the Contents by id so their rows survive.
          if (container.contents !== undefined) {
            const keptContentIds = container.contents
              .map((content) => content.id)
              .filter((id): id is string => !!id);
            const removedContentIds = existing.contents
              .filter((content) => !keptContentIds.includes(content.id))
              .map((content) => content.id);
            if (removedContentIds.length > 0) {
              await tx.content.deleteMany({ where: { id: { in: removedContentIds } } });
            }
            for (const content of container.contents) {
              const isExisting = !!content.id && existing.contents.some((c) => c.id === content.id);
              if (isExisting) {
                await tx.content.update({
                  where: { id: content.id! },
                  data: { type_id: content.type_id, quantity: content.quantity },
                });
              } else {
                await tx.content.create({
                  data: {
                    container_id: existing.id,
                    type_id: content.type_id,
                    quantity: content.quantity,
                  },
                });
              }
            }
          }

          await tx.container.update({
            where: { id: existing.id },
            data: {
              packaging: container.packaging ?? existing.packaging,
              demand_id: demandId,
              ...(container.contents !== undefined
                ? { weight: weight ?? 0, volume: volume ?? 0, value: value ?? 0 }
                : {}),
            },
          });
        } else {
          await tx.container.create({
            data: {
              id: container.id ?? ContainersService.formatContainerID(nextContainerNumber++),
              weight: weight ?? 0,
              volume: volume ?? 0,
              value: value ?? 0,
              packaging: container.packaging ?? PackagingType.NONE,
              demand_id: demandId,
              contents: {
                create: (container.contents ?? []).map((content) => ({
                  type: {
                    connect: { id: content.type_id },
                  },
                  quantity: content.quantity,
                })),
              },
            },
          });
        }
      }

      if (linkedIds.length > 0) {
        await tx.container.updateMany({
          where: { id: { in: linkedIds } },
          data: { demand_id: demandId },
        });
      }

      return tx.demand.update({
        where: { id: demandId },
        data: {
          status: data.status,
          validated_at: validated_at,
          association_id: data.association_id,
          document: documentKey,
        },
        include: demandInclude,
      });
    });

    if (oldDocumentKey) {
      FilesService.deleteByKey(oldDocumentKey).catch(console.error);
    }

    return DemandDto.parseWithDocumentUrl(demand);
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
      include: demandInclude,
    });
    if (demand.document) {
      FilesService.deleteByKey(demand.document).catch(console.error);
    }

    return DemandDto.parseWithDocumentUrl(demand);
  }
}

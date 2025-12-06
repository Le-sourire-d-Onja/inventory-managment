import { Demand } from "@/lib/generated/prisma";
import { ContainerEntity, containerInclude } from "../../containers/entity/container.entity";
import { AssociationEntity } from "../../associations/entity/association.entity";

export type DemandEntity = Demand & { containers: ContainerEntity[], association: AssociationEntity };

export const demandInclude = {
  containers: {
    include: containerInclude,
  },
  association: true,
}
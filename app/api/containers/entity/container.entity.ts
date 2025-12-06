import { Association, Container } from "@/lib/generated/prisma";
import { ContentEntity, contentInclude } from "./content.entity";

export type ContainerEntity = Container & { contents: ContentEntity[], demand: { association: Association } | null }

export const containerInclude = {
  contents: {
    include: contentInclude,
  },
  demand: {
    include: {
      association: true,
    }
  }
}

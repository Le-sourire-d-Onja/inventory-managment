import {
  ArticleType,
  Association,
  Container,
  Content,
  Demand,
} from "@/lib/generated/prisma";
import { contentInclude } from "../../containers/entity/content.entity";

export type AssociationEntity = Association;

export type AssociationExportContainer = Container & {
  contents: (Content & { type: ArticleType })[];
};

export type AssociationExportDemand = Demand & {
  containers: AssociationExportContainer[];
};

export type AssociationExportEntity = Association & {
  demands: AssociationExportDemand[];
};

export const associationExportInclude = {
  demands: {
    include: {
      containers: {
        include: {
          contents: {
            include: contentInclude,
          },
        },
      },
    },
  },
};

import type { ExportCell, ExportSheet } from "../../exports/exports.service";
import { ContainerDto } from "../../containers/dto/container.dto";
import { DemandDto } from "../../demands/dto/demand.dto";
import { AssociationDto } from "./association.dto";
import {
  AssociationExportContainer,
  AssociationExportDemand,
  AssociationExportEntity,
} from "../entity/association.entity";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** `jj/mm/aaaa`, pour les dates qui ne portent pas d'acte. */
export function formatDate(date: Date): string {
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
}

/** `jj/mm/aaaa hh:mm`, pour les dates d'empotage et de distribution. */
export function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function sum(
  values: { weight: number; volume: number; value: number }[],
): [number, number, number] {
  return values.reduce<[number, number, number]>(
    ([weight, volume, value], item) => [
      weight + item.weight,
      volume + item.volume,
      value + item.value,
    ],
    [0, 0, 0],
  );
}

/**
 * Export XLSX d'une seule Association : sa fiche et ses totaux, puis ses
 * Demandes, leurs Contenants actuellement rattachés et leurs Contenus.
 * Les Contenants libres ou détachés n'apparaissent jamais.
 */
export class AssociationExportDto {
  association: AssociationDto;
  demands: AssociationExportDemand[];

  constructor(association: AssociationDto, demands: AssociationExportDemand[]) {
    this.association = association;
    this.demands = demands;
  }

  static parse(obj: AssociationExportEntity): AssociationExportDto {
    const demands = [...obj.demands]
      .sort(
        (first, second) =>
          first.created_at.getTime() - second.created_at.getTime() ||
          first.id.localeCompare(second.id),
      )
      .map((demand) => ({
        ...demand,
        containers: [...demand.containers].sort((first, second) =>
          first.id.localeCompare(second.id),
        ),
      }));
    return new AssociationExportDto(AssociationDto.parse(obj), demands);
  }

  get containers(): AssociationExportContainer[] {
    return this.demands.flatMap((demand) => demand.containers);
  }

  /** Nom de fichier `association-<nom-ascii>-<aaaammjj>.xlsx`, replié sur l'id. */
  static fileName(association: AssociationDto, date = new Date()): string {
    const name =
      AssociationExportDto.asciiSlug(association.name) || association.id;
    const stamp = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
    return `association-${name}-${stamp}.xlsx`;
  }

  static asciiSlug(value: string): string {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/œ/gi, "oe")
      .replace(/æ/gi, "ae")
      .replace(/ß/g, "ss")
      .replace(/ø/gi, "o")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase();
  }

  sheets(): ExportSheet[] {
    return [
      { name: "Association", rows: this.associationSheet() },
      { name: "Demandes", rows: this.demandsSheet() },
      { name: "Contenants", rows: this.containersSheet() },
      { name: "Contenus", rows: this.contentsSheet() },
    ];
  }

  private associationSheet(): ExportCell[][] {
    const association = this.association;
    const [weight, volume, value] = sum(this.containers);

    return [
      ["Fiche de l'association"],
      ["Nom", association.name],
      ["Type", AssociationDto.typeTxt(association.type)],
      ["Personne en charge", association.person_in_charge],
      ["Adresse", association.address],
      ["E-mail", association.email],
      ["Téléphone", association.phone],
      ["Description", association.description],
      ["Créée le", formatDate(association.created_at)],
      ["Mise à jour le", formatDate(association.updated_at)],
      [],
      ["Totaux"],
      ["Nombre de demandes", this.demands.length],
      ["Nombre de contenants", this.containers.length],
      ["Poids total (kg)", weight],
      ["Volume total (m³)", volume],
      ["Valeur totale (€)", value],
    ];
  }

  private demandsSheet(): ExportCell[][] {
    return [
      [
        "Identifiant",
        "Statut",
        "Créée le",
        "Mise à jour le",
        "Document",
        "Nombre de contenants",
        "Poids (kg)",
        "Volume (m³)",
        "Valeur (€)",
        "Contenants",
      ],
      ...this.demands.map((demand): ExportCell[] => {
        const [weight, volume, value] = sum(demand.containers);
        return [
          demand.id,
          DemandDto.statusData(DemandDto.deriveStatus(demand.containers)).text,
          formatDate(demand.created_at),
          formatDate(demand.updated_at),
          demand.document ? "Oui" : "Non",
          demand.containers.length,
          weight,
          volume,
          value,
          demand.containers.map((container) => `N°${container.id}`).join(", "),
        ];
      }),
    ];
  }

  private containersSheet(): ExportCell[][] {
    return [
      [
        "Identifiant",
        "Demande",
        "Statut",
        "Empaquetage",
        "Poids (kg)",
        "Volume (m³)",
        "Valeur (€)",
        "Date d'empotage",
        "Date de distribution",
      ],
      ...this.demands.flatMap((demand) =>
        demand.containers.map((container): ExportCell[] => [
          `N°${container.id}`,
          demand.id,
          ContainerDto.containerState({
            association: null,
            demand_id: demand.id,
            containerized_at: container.containerized_at,
            distributed_at: container.distributed_at,
          }).text,
          DemandDto.packagingTxt(container.packaging),
          container.weight,
          container.volume,
          container.value,
          container.containerized_at ? formatDateTime(container.containerized_at) : "",
          container.distributed_at ? formatDateTime(container.distributed_at) : "",
        ]),
      ),
    ];
  }

  private contentsSheet(): ExportCell[][] {
    return [
      [
        "Contenant",
        "Demande",
        "Type d'article",
        "Quantité",
        "Poids unitaire (kg)",
        "Volume unitaire (m³)",
        "Valeur unitaire (€)",
        "Poids de ligne (kg)",
        "Volume de ligne (m³)",
        "Valeur de ligne (€)",
      ],
      ...this.demands.flatMap((demand) =>
        demand.containers.flatMap((container) =>
          [...container.contents]
            .sort((first, second) => first.type.name.localeCompare(second.type.name))
            .map((content): ExportCell[] => [
              `N°${container.id}`,
              demand.id,
              content.type.name,
              content.quantity,
              content.type.weight,
              content.type.volume,
              content.type.value,
              content.quantity * content.type.weight,
              content.quantity * content.type.volume,
              content.quantity * content.type.value,
            ]),
        ),
      ),
    ];
  }
}

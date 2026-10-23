import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Download, Eye, Pen, Trash } from "lucide-react";
import { DemandDto } from "../api/demands/dto/demand.dto";
import { Badge } from "@/components/ui/badge";
import { localeDateOptions, formatEuro, formatVolume, formatWeight } from "@/lib/utils";
import { AssociationDto } from "../api/associations/dto/association.dto";
import { InfoBubble } from "@/components/info-bubble";
import { ContainerDto } from "../api/containers/dto/container.dto";
import { STATUS_TOKENS, StatusToken } from "@/lib/status-tokens";

const PROGRESS_SEGMENTS: { key: StatusToken; label: string }[] = [
  { key: "assigned", label: "Attribué" },
  { key: "containerized", label: "Empoté" },
  { key: "distributed", label: "Distribué" },
];

/**
 * Segmented progress bar shown in the Status bubble: the share of the Demand's
 * Containers still Attribué, already Empoté, and Distribué.
 */
function DemandProgress({ containers }: { containers: ContainerDto[] }) {
  const total = containers.length;
  if (total === 0) {
    return <p className="text-xs">Aucun contenant</p>;
  }

  const segments = PROGRESS_SEGMENTS.map((segment) => ({
    ...segment,
    color: STATUS_TOKENS[segment.key].backgroundClass,
    count: containers.filter((container) => container.state.key === segment.key).length,
  }));

  return (
    <div className="flex w-48 flex-col gap-2">
      <p className="text-xs font-medium">Progression</p>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
        {segments.map((segment) => (
          <div key={segment.key} className={segment.color} style={{ width: `${(segment.count / total) * 100}%` }} />
        ))}
      </div>
      <ul className="flex flex-col gap-1">
        {segments.map((segment) => (
          <li key={segment.key} className="flex items-center gap-1.5 text-xs">
            <span className={`size-2.5 rounded-full ${segment.color}`} />
            {segment.label} : {segment.count}/{total}
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Les Types d'article placés dans un Contenant, chacun suivi de sa quantité.
 * Contenu de la bulle attachée à l'identifiant du Contenant, comme la barre de
 * progression l'est à celle du Statut de la Demande.
 */
function ContainerContents({ container }: { container: ContainerDto }) {
  if (container.contents.length === 0) {
    return <p className="text-xs">Aucun contenu</p>;
  }

  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs font-medium">Contenu</p>
      <ul className="flex flex-col gap-1">
        {container.contents.map((content) => (
          <li key={content.id} className="text-xs">
            {content.type.name} ({content.quantity})
          </li>
        ))}
      </ul>
    </div>
  );
}

export const columns = (
  onView: (id: string) => void,
  onEdit: (id: string) => void,
  onRemove: (id: string) => void,
  onDownload: (id: string) => void,
): ColumnDef<DemandDto>[] => [
  {
    id: "name",
    accessorFn: (row) => row.association.name,
    header: "Nom",
    cell: (props) => {
      const row = props.row.original;
      return (
        <div className="flex flex-col">
          <p className="w-70 overflow-clip text-ellipsis"> {row.association.name} </p>
          <p className="text-muted-foreground text-xs">{AssociationDto.typeTxt(row.association.type)}</p>
        </div>
      );
    },
  },
  {
    id: "containers",
    accessorFn: (row) => row.containers.map((container) => container.id),
    header: "Contenants",
    cell: (props) => {
      const row = props.row.original;
      if (row.containers.length === 0) {
        return <> - </>;
      }
      return (
        <div className="flex flex-wrap gap-1 pb-1">
          {row.containers
            .sort((a, b) => a.id.localeCompare(b.id))
            .map((container) => (
              <InfoBubble key={container.id} content={<ContainerContents container={container} />}>
                <Badge className={`cursor-default ${container.state.color}`}>N°{container.id}</Badge>
              </InfoBubble>
            ))}
        </div>
      );
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Statut",
    cell: (props) => {
      const row = props.row.original;
      const statusTxt = DemandDto.statusData(row.status);
      const statusDate = DemandDto.statusDate(row);
      return (
        <InfoBubble content={<DemandProgress containers={row.containers} />}>
          <div className="flex w-fit cursor-default flex-col gap-1.5">
            <Badge className={`${statusTxt.color}`}>{statusTxt.text}</Badge>
            {statusDate ? (
              <p className="text-muted-foreground text-xs">
                Depuis le {statusDate.toLocaleDateString("fr-FR", localeDateOptions)}{" "}
              </p>
            ) : (
              <></>
            )}
          </div>
        </InfoBubble>
      );
    },
  },
  {
    id: "total_weight",
    accessorFn: (row) => row.containers.reduce((prev, curr) => prev + curr.weight, 0),
    header: "Poids total",
    cell: (props) => {
      const weight = props.getValue() as number;
      return <> {formatWeight(weight)} kg </>;
    },
  },
  {
    id: "total_volume",
    accessorFn: (row) => row.containers.reduce((prev, curr) => prev + curr.volume, 0),
    header: "Volume total",
    cell: (props) => {
      const volume = props.getValue() as number;
      return <> {formatVolume(volume)} m³ </>;
    },
  },
  {
    id: "total_value",
    accessorFn: (row) => row.containers.reduce((prev, curr) => prev + curr.value, 0),
    header: "Valeur totale",
    cell: (props) => {
      const value = props.getValue() as number;
      return <> {formatEuro(value)} </>;
    },
  },
  {
    id: "actions",
    cell: (props) => {
      const row = props.row.original;
      return (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" onClick={() => onView(row.id)}>
            <Eye />
          </Button>
          <Button variant="ghost" onClick={() => onEdit(row.id)}>
            <Pen />
          </Button>
          <Button variant="ghost" onClick={() => onDownload(row.id)}>
            <Download />
          </Button>
          <Button variant="ghost" onClick={() => onRemove(row.id)}>
            <Trash className="text-destructive" />
          </Button>
        </div>
      );
    },
  },
];

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Download, Eye, Pen, Trash } from "lucide-react";
import { DemandDto } from "../api/demands/dto/demand.dto";
import { Badge } from "@/components/ui/badge";
import { localeDateOptions, formatEuro, formatVolume, formatWeight } from "@/lib/utils";
import { AssociationDto } from "../api/associations/dto/association.dto";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ContainerDto } from "../api/containers/dto/container.dto";

const PROGRESS_SEGMENTS = [
  { state: "Attribué", color: "bg-green-300" },
  { state: "Empoté", color: "bg-blue-300" },
  { state: "Distribué", color: "bg-purple-300" },
] as const;

/**
 * Segmented progress bar shown on hover: the share of the Demand's Containers
 * still Attribué, already Empoté, and Distribué.
 */
function DemandProgress({ containers }: { containers: ContainerDto[] }) {
  const total = containers.length;
  if (total === 0) {
    return <p className="text-xs">Aucun contenant</p>;
  }

  const segments = PROGRESS_SEGMENTS.map((segment) => ({
    ...segment,
    count: containers.filter((container) => container.state.text === segment.state).length,
  }));

  return (
    <div className="flex w-48 flex-col gap-2">
      <p className="text-xs font-medium">Progression</p>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
        {segments.map((segment) => (
          <div key={segment.state} className={segment.color} style={{ width: `${(segment.count / total) * 100}%` }} />
        ))}
      </div>
      <ul className="flex flex-col gap-1">
        {segments.map((segment) => (
          <li key={segment.state} className="flex items-center gap-1.5 text-xs">
            <span className={`size-2.5 rounded-full ${segment.color}`} />
            {segment.state} : {segment.count}/{total}
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
              <Badge key={container.id}>N°{container.id}</Badge>
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
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent>
            <DemandProgress containers={row.containers} />
          </TooltipContent>
        </Tooltip>
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

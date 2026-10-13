import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Package, Pen, Trash, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ContainerDto } from "../api/containers/dto/container.dto";
import { formatEuro, formatVolume, formatWeight } from "@/lib/utils";
import { matchesAnyArticleType } from "./filters";

export const columns = (
  onView: (id: string) => void,
  onEdit: (id: string) => void,
  onRemove: (id: string) => void,
  onContainerize: (id: string) => void,
  onDistribute: (id: string) => void,
): ColumnDef<ContainerDto>[] => [
  {
    id: "id",
    accessorFn: (row) => `${row.id} ${row.association?.name ?? ""}`,
    header: "Identifiant",
    cell: (props) => {
      const row = props.row.original;
      return <p> N°{row.id} </p>;
    },
  },
  {
    id: "content",
    accessorFn: (row) => row.contents.map((content) => content.type.name),
    header: "Contenu",
    filterFn: (row, _columnId, filterValue) =>
      matchesAnyArticleType(row.original.contents, filterValue as string[]),
    cell: (props) => {
      const row = props.row.original;
      return (
        <div className="flex gap-1 w-95 pb-1 overflow-x-scroll">
          {row.contents.map((content) => (
            <Badge key={content.id}>{content.type.name}</Badge>
          ))}
        </div>
      );
    },
  },
  {
    id: "association",
    accessorFn: (row) => row.association?.name,
    header: "Association",
    cell: (props) => {
      const association = props.getValue() as string;
      return <p className="w-50 text-ellipsis overflow-clip"> {association ?? "-"} </p>;
    },
  },

  {
    id: "status",
    accessorFn: (row) => ContainerDto.containerState(row).text,
    header: "Statut",
    cell: (props) => {
      const row = props.row.original;
      const state = ContainerDto.containerState(row);
      return <Badge className={state.color}>{state.text}</Badge>;
    },
  },
  {
    id: "total_weight",
    accessorFn: (row) => row.contents.reduce((prev, curr) => prev + curr.quantity * curr.type.weight, 0),
    header: "Poids total",
    cell: (props) => {
      const weight = props.getValue() as number;
      return <> {formatWeight(weight)} kg </>;
    },
  },
  {
    id: "total_volume",
    accessorFn: (row) => row.contents.reduce((prev, curr) => prev + curr.quantity * curr.type.volume, 0),
    header: "Volume total",
    cell: (props) => {
      const volume = props.getValue() as number;
      return <> {formatVolume(volume)} m³ </>;
    },
  },
  {
    id: "total_value",
    accessorFn: (row) => row.contents.reduce((prev, curr) => prev + curr.quantity * curr.type.value, 0),
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
      const state = ContainerDto.containerState(row);
      return (
        <div className="flex justify-end gap-1">
          {state.text === "Attribué" && (
            <Button variant="ghost" onClick={() => onContainerize(row.id)}>
              <Package />
            </Button>
          )}
          {state.text === "Empoté" && (
            <Button variant="ghost" onClick={() => onDistribute(row.id)}>
              <Truck />
            </Button>
          )}
          <Button variant="ghost" onClick={() => onView(row.id)}>
            <Eye />
          </Button>
          <Button variant="ghost" onClick={() => onEdit(row.id)}>
            <Pen />
          </Button>
          <Button variant="ghost" onClick={() => onRemove(row.id)}>
            <Trash className="text-destructive" />
          </Button>
        </div>
      );
    },
  },
];

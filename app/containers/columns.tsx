import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Pen, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ContainerDto } from "../api/containers/dto/container.dto";

export const columns = (
  onView: (id: string) => void,
  onEdit: (id: string) => void,
  onRemove: (id: string) => void,
): ColumnDef<ContainerDto>[] => [
  {
    accessorKey: "id",
    header: "Identifiant",
    cell: (props) => {
      const row = props.row.original;
      return (<p> N°{row.id} </p>)
    }
  },
  {
    accessorFn: (row) =>
      row.contents.map((content) => content.type.name),
    header: "Contenu",
    cell: (props) => {
      const row = props.row.original;
      return (
        <div className="flex gap-1 w-[500px] overflow-x-hidden" >
          {row.contents.map((content) => <Badge key={content.id}>{content.type.name}</Badge>)}
        </div>
      )
    }
  },
  {
    accessorKey: "association_id",
    header: "Statut",
    cell: (props) => {
      const row = props.row.original;
      const state = ContainerDto.containerState(row);
      return (
        <div className="flex flex-col gap-1.5">
          <Badge className={state.color}>{state.text}</Badge>
          {row.association ? (
            <p className="text-muted-foreground text-xs">
              À {row.association.name}
            </p>
          ) : (
            <></>
          )}
        </div>
      );
    }
  },
  {
    id: "total_weight",
    accessorFn: (row) =>
      row.contents.reduce((prev, curr) => prev + curr.quantity * curr.type.weight, 0),
    header: "Poids total",
    cell: (props) => {
      const weight = props.getValue() as number;
      return <> {weight.toFixed(2)} kg </>;
    },
  },
  {
    id: "total_volume",
    accessorFn: (row) =>
      row.contents.reduce((prev, curr) => prev + curr.quantity * curr.type.volume, 0),
    header: "Volume total",
    cell: (props) => {
      const volume = props.getValue() as number;
      return <> {volume.toFixed(2)} m³ </>;
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
          <Button variant="ghost" onClick={() => onRemove(row.id)}>
            <Trash className="text-destructive" />
          </Button>
        </div>
      );
    },
  },
];

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Pen, Trash } from "lucide-react";
import { DemandEntity } from "../api/demands/entity/demand.entity";
import { Badge } from "@/components/ui/badge";
import { DemandStatus } from "@/lib/generated/prisma";
import { localeDateOptions } from "@/lib/utils";

export const columns = (
  onView: (id: string) => void,
  onEdit: (id: string) => void,
  onRemove: (id: string) => void,
  onValidate: (id: string) => void
): ColumnDef<DemandEntity>[] => [
  {
    accessorKey: "name",
    header: "Nom",
    cell: (props) => {
      const row = props.row.original;
      return (
        <div className="flex flex-col">
          <p> {row.association.name} </p>
          <p className="text-muted-foreground text-xs">
            {row.association.type}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: (props) => {
      const row = props.row.original;
      const statusTxt = DemandEntity.statusTxt(row.status);
      return <Badge className={`${statusTxt.color}`}>{statusTxt.text}</Badge>;
    },
  },
  {
    id: "total_weight",
    accessorFn: (row) =>
      row.containers.reduce((prev, curr) => prev + curr.weight, 0),
    header: "Poids total",
    cell: (props) => {
      const weight = props.getValue() as number;
      return <> {weight} kg </>;
    },
  },
  {
    id: "total_volume",
    accessorFn: (row) =>
      row.containers.reduce((prev, curr) => prev + curr.volume, 0),
    header: "Volume total",
    cell: (props) => {
      const volume = props.getValue() as number;
      return <> {volume} m³ </>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date de création",
    cell: (props) => {
      const row = props.row.original;
      return (
        <> {row.createdAt.toLocaleDateString("fr-FR", localeDateOptions)} </>
      );
    },
  },
  {
    accessorKey: "validatedAt",
    header: "Date de validation",
    cell: (props) => {
      const row = props.row.original;
      if (!row.validatedAt) {
        return (
          <Button variant="secondary" onClick={() => onValidate(row.id)}>
            Valider la demande
          </Button>
        );
      }
      return (
        <> {row.validatedAt.toLocaleDateString("fr-FR", localeDateOptions)} </>
      );
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

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Check, Eye, Pen, Trash } from "lucide-react";
import { DemandEntity } from "../api/demands/entity/demand.entity";
import { Badge } from "@/components/ui/badge";
import { localeDateOptions } from "@/lib/utils";
import { AssociationEntity } from "../api/associations/entity/association.entity";
import { DemandStatus } from "@/lib/generated/prisma";

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
            {AssociationEntity.typeTxt(row.association.type)}
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
      const statusDate = DemandEntity.statusDate(row);
      return (
        <div className="flex flex-col gap-1.5">
          <Badge className={`${statusTxt.color}`}>{statusTxt.text}</Badge>
          {statusDate ? (
            <p className="text-muted-foreground text-xs">
              Depuis le{" "}
              {statusDate.toLocaleDateString("fr-FR", localeDateOptions)}{" "}
            </p>
          ) : (
            <></>
          )}
        </div>
      );
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
    id: "actions",
    cell: (props) => {
      const row = props.row.original;
      return (
        <div className="flex justify-end gap-1">
          {row.status !== DemandStatus.VALIDATED && (
            <Button variant="ghost" onClick={() => onValidate(row.id)}>
              <Check />
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

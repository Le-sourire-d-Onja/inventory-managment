import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Dot, Eye, Pen, Trash } from "lucide-react";
import { DemandEntity } from "../api/demands/entity/demand.entity";
import { Badge } from "@/components/ui/badge";
import { DemandStatus } from "@/lib/generated/prisma";

export const columns = (
  onView: (id: string) => void,
  onEdit: (id: string) => void,
  onRemove: (id: string) => void
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
    id: "actions",
    cell: (props) => {
      const row = props.row.original;
      return (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" onClick={() => onView(row.id)}>
            <Eye />
          </Button>
          {row.status === DemandStatus.IN_PROGRESS && (
            <Button variant="ghost" onClick={() => onEdit(row.id)}>
              <Pen />
            </Button>
          )}
          <Button variant="ghost" onClick={() => onRemove(row.id)}>
            <Trash className="text-destructive" />
          </Button>
        </div>
      );
    },
  },
];

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Pen, Trash } from "lucide-react";
import { ArticleType } from "@/lib/generated/prisma";

export const columns = (
  onView: (id: string) => void,
  onEdit: (id: string) => void,
  onRemove: (id: string) => void
): ColumnDef<ArticleType>[] => [
  {
    accessorKey: "name",
    header: "Nom",
  },
  {
    accessorKey: "weight",
    header: "Poids",
    cell: (props) => {
      const row = props.row.original;
      return <> {row.weight} kg </>;
    },
  },
  {
    accessorKey: "volume",
    header: "Poids",
    cell: (props) => {
      const row = props.row.original;
      return <> {row.volume} m³ </>;
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

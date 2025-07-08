import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Pen, Trash } from "lucide-react";
import { DonationEntity } from "../api/donations/entity/donation.entity";
import { localeDateOptions } from "@/lib/utils";
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

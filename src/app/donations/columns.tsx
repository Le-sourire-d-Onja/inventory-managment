import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Pen, Trash } from "lucide-react";
import { DonationWithArticles } from "./donations-client";


export const columns = (
  onView: (donation: DonationWithArticles) => void,
  onDelete: (id: string) => void,
  onEdit?: (donation: DonationWithArticles) => void
): ColumnDef<DonationWithArticles>[] => [
    {
      accessorKey: "name",
      header: "Nom",
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => row.original.description.length > 30 ? row.original.description.slice(0, 30) + "..." : row.original.description || "Aucune description",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Téléphone",
      cell: ({ row }) => row.original.phone || "Aucune téléphone",
    },
    {
      id: "actions",
      header: "",
      cell: (props) => {
        const donation = props.row.original;
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onView(props.row.original);
              }}
            >
              <Eye />
            </Button>
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(props.row.original);
              }}
            >
              <Pen />
            </Button>
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(props.row.original.id);
              }}
            >
              <Trash />
            </Button>
          </div>
        );
      },
    },
  ];

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Pen, Trash } from "lucide-react";
import { DonationDto } from "../api/donations/dto/donation.dto";
import { localeDateOptions } from "@/lib/utils";
import { ArticleDto } from "../api/donations/dto/article.dto";
import { Badge } from "@/components/ui/badge";

export const columns = (
  onView: (id: string) => void,
  onEdit: (id: string) => void,
  onRemove: (id: string) => void
): ColumnDef<DonationDto>[] => [
  {
    id: "articles",
    accessorFn: (row) => row.articles,
    header: "Articles",
    cell: (props) => {
      const articles = props.getValue() as ArticleDto[]
      return (
        <div className="flex gap-1 overflow-x-hidden" >
          {articles.map((article) => <Badge key={article.id}>{article.type.name}</Badge>)}
        </div>
      )
    }
  },
  {
    id: "total_quantity",
    accessorFn: (row) =>
      row.articles.reduce((prev, curr) => prev + curr.quantity, 0),
    header: "Quantité totale",
    cell: (props) => {
      const quantity = props.getValue() as number;
      return (
        <>
          {quantity} article{quantity > 1 ? "s" : ""}{" "}
        </>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: (props) => {
      const row = props.row.original;
      return (
        <>
          {row.description && row.description.length > 30
            ? `${row.description.substring(0, 30)}...`
            : row.description}
        </>
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

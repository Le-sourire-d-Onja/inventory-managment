import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Pen, Trash } from "lucide-react";
import { DonationEntity } from "../api/donations/entity/donation.entity";
import { localeDateOptions } from "@/lib/utils";
import { ArticleEntity } from "../api/donations/entity/article.entity";
import { Badge } from "@/components/ui/badge";

export const columns = (
  onView: (id: string) => void,
  onEdit: (id: string) => void,
  onRemove: (id: string) => void
): ColumnDef<DonationEntity>[] => [
  {
    id: "articles",
    accessorFn: (row) => row.articles,
    header: "Articles",
    cell: (props) => {
      const articles = props.getValue() as ArticleEntity[]
      return <div className="flex" >
        {articles.map((article) => <Badge>{article.type.name}</Badge>)}
      </div>
    }
  },
  {
    id: "total_value",
    accessorFn: (row) =>
      row.articles.reduce((prev, curr) => prev + curr.price, 0),
    header: "Valeur totale",
    cell: (props) => {
      return <> {props.getValue()}€ </>;
    },
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

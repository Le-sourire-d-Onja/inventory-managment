import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Pen, Trash } from "lucide-react";
import { DonationEntity } from "../api/donations/entity/donation.entity";
import { localeDateOptions } from "@/lib/utils";

export const columns = (
  onView: (id: string) => void,
  onEdit: (id: string) => void,
  onRemove: (id: string) => void
): ColumnDef<DonationEntity>[] => [
  {
    accessorKey: "name",
    header: "Nom",
    cell: (props) => {
      const row = props.row.original;
      return (
        <div className="flex flex-col">
          <p> {row.name} </p>
          <p className="text-muted-foreground text-xs">
            Créée le:{" "}
            {row.createdAt.toLocaleDateString("fr-FR", localeDateOptions)}
          </p>
        </div>
      );
    },
  },
  {
    accessorFn: (row) => `${row.email} ${row.phone}`,
    header: "Contact",
    cell: (props) => {
      const row = props.row.original;
      return (
        <div className="flex flex-col">
          {row.email ? (
            <p className="flex">
              <span className="min-w-[90px]"> Email: </span> {row.email}
            </p>
          ) : (
            <></>
          )}
          {row.phone ? (
            <p className="flex">
              <span className="min-w-[90px]">Téléphone: </span> {row.phone}
            </p>
          ) : (
            <></>
          )}
        </div>
      );
    },
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

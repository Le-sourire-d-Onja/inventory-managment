import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Eye, Pen, Trash } from "lucide-react";
import { AssociationEntity } from "../api/associations/entity/association.entity";
import { localeDateOptions } from "@/lib/utils";

export const columns = (
  onView: (id: string) => void,
  onEdit: (id: string) => void,
  onRemove: (id: string) => void
): ColumnDef<AssociationEntity>[] => [
  {
    accessorKey: "name",
    header: "Nom",
    cell: (props) => {
      const row = props.row.original;
      return (
        <div className="flex flex-col">
          <p> {row.name} </p>
          <p className="text-muted-foreground text-xs">
            {AssociationEntity.typeTxt(row.type)}
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
        <div className="flex flex-col w-fit">
          <p className="flex">
            <span className="min-w-[110px]"> Responsable: </span>{" "}
            {row.person_in_charge}
          </p>
          <p className="flex">
            <span className="min-w-[110px]"> Email: </span> {row.email}
          </p>
          <p className="flex">
            <span className="min-w-[110px]">Téléphone: </span> {row.phone}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "address",
    header: "Adresse",
    cell: (props) => {
      const row = props.row.original;
      return (
        <div className="flex max-w-[150px]">
          <p className="break-words whitespace-normal">{row.address}</p>
        </div>
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
            : row.description}{" "}
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

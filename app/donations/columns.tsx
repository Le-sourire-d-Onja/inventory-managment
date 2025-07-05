import { ColumnDef } from "@tanstack/react-table";
import { DonationDto } from "../api/donations/dto/donation.dto";
import { Button } from "@/components/ui/button";
import { Pen, Trash } from "lucide-react";

export const columns = (
  onEdit: (id: string) => void,
  onRemove: (id: string) => void
): ColumnDef<DonationDto>[] => [
  {
    accessorKey: "name",
    header: "Nom",
  },
  {
    accessorFn: (row) => `${row.email} ${row.phone}`,
    header: "Contact",
    cell: (props) => {
      const row = props.row.original;
      return (
        <div className="flex flex-col">
          {row.email ? <p> Email: {row.email} </p> : <></>}
          {row.phone ? <p> Téléphone: {row.phone} </p> : <></>}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date de création",
    cell: (props) => {
      const row = props.row.original;
      return <> {row.createdAt?.toLocaleDateString()} </>;
    },
  },
  {
    id: "actions",
    cell: (props) => {
      const row = props.row.original;
      return (
        <div className="flex justify-end gap-1">
          <Button variant="secondary" onClick={() => onEdit(row.id)}>
            <Pen />
          </Button>
          <Button variant="secondary" onClick={() => onRemove(row.id)}>
            <Trash />
          </Button>
        </div>
      );
    },
  },
];

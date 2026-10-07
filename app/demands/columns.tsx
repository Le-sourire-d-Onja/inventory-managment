import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Check, Download, Eye, Pen, Trash } from "lucide-react";
import { DemandDto } from "../api/demands/dto/demand.dto";
import { Badge } from "@/components/ui/badge";
import { localeDateOptions, formatEuro } from "@/lib/utils";
import { AssociationDto } from "../api/associations/dto/association.dto";
import { DemandStatus } from "@/lib/generated/prisma";
import { StockDto } from "../api/stocks/dto/stock.dto";

export const columns = (
  stocks: StockDto[],
  onView: (id: string) => void,
  onEdit: (id: string) => void,
  onRemove: (id: string) => void,
  onValidate: (id: string) => void,
  onDownload: (id: string) => void,
): ColumnDef<DemandDto>[] => [
  {
    id: "name",
    accessorFn: (row) => row.association.name,
    header: "Nom",
    cell: (props) => {
      const row = props.row.original;
      return (
        <div className="flex flex-col">
          <p className="w-70 overflow-clip text-ellipsis"> {row.association.name} </p>
          <p className="text-muted-foreground text-xs">{AssociationDto.typeTxt(row.association.type)}</p>
        </div>
      );
    },
  },
  {
    id: "containers",
    accessorFn: (row) => row.containers.map((container) => container.id),
    header: "Contenants",
    cell: (props) => {
      const row = props.row.original;
      if (row.containers.length === 0) {
        return <> - </>;
      }
      return (
        <div className="flex gap-1 w-95 pb-1 overflow-x-scroll">
          {row.containers.map((container) => (
            <Badge key={container.id}>N°{container.id}</Badge>
          ))}
        </div>
      );
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Statut",
    cell: (props) => {
      const row = props.row.original;
      const statusTxt = DemandDto.statusData(row.status);
      const statusDate = DemandDto.statusDate(row);
      return (
        <div className="flex flex-col gap-1.5">
          <Badge className={`${statusTxt.color}`}>{statusTxt.text}</Badge>
          {statusDate ? (
            <p className="text-muted-foreground text-xs">
              Depuis le {statusDate.toLocaleDateString("fr-FR", localeDateOptions)}{" "}
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
    accessorFn: (row) => row.containers.reduce((prev, curr) => prev + curr.weight, 0),
    header: "Poids total",
    cell: (props) => {
      const weight = props.getValue() as number;
      return <> {weight} kg </>;
    },
  },
  {
    id: "total_volume",
    accessorFn: (row) => row.containers.reduce((prev, curr) => prev + curr.volume, 0),
    header: "Volume total",
    cell: (props) => {
      const volume = props.getValue() as number;
      return <> {volume} m³ </>;
    },
  },
  {
    id: "total_value",
    accessorFn: (row) => row.containers.reduce((prev, curr) => prev + curr.value, 0),
    header: "Valeur totale",
    cell: (props) => {
      const value = props.getValue() as number;
      return <> {formatEuro(value)} </>;
    },
  },
  {
    id: "actions",
    cell: (props) => {
      const row = props.row.original;
      const contents = row.containers.flatMap((container) => container.contents);
      const hasStock = contents.every((content) => {
        const stock = stocks.find((stock) => stock.type.id === content.type.id);
        return stock && stock.quantity >= content.quantity;
      });
      return (
        <div className="flex justify-end gap-1">
          {row.status !== DemandStatus.VALIDATED && hasStock && (
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
          <Button variant="ghost" onClick={() => onDownload(row.id)}>
            <Download />
          </Button>
          <Button variant="ghost" onClick={() => onRemove(row.id)}>
            <Trash className="text-destructive" />
          </Button>
        </div>
      );
    },
  },
];

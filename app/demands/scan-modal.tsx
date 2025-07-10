import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Scanner } from "@yudiel/react-qr-scanner";
import { useState } from "react";
import { toast } from "sonner";
import { DemandEntity } from "../api/demands/entity/demand.entity";
import { MoonLoader } from "react-spinners";
import z from "zod";

type ScanModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ScanModal(props: ScanModalProps) {
  const { open, onOpenChange } = props;
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [data, setData] = useState<DemandEntity | null>(null);

  async function retrieveDemand(value: string) {
    const isUUID = z.string().uuid();
    const result = isUUID.safeParse(value);
    if (!result.success) {
      toast("QR code incorrect");
      return;
    }
    setIsLoading(true);
    fetch(`/api/demands?id=${result.data}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw res;
      })
      .then((res) => (res ? DemandEntity.parse(res) : null))
      .then((data) => setData(data))
      .catch((err) => toast("Demande non trouvée"))
      .finally(() => setIsLoading(false));
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Scanner une demande
          </DialogTitle>
        </DialogHeader>
        <Scanner onScan={(result) => retrieveDemand(result[0].rawValue)} />
        {!isLoading ? (
          <></>
        ) : (
          <MoonLoader size={20} color="var(--color-foreground)" />
        )}
      </DialogContent>
    </Dialog>
  );
}

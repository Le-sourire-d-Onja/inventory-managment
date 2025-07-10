import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Scanner } from "@yudiel/react-qr-scanner";
import { toast } from "sonner";
import z from "zod";
import { useRouter } from "next/navigation";

type ScanModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ScanModal(props: ScanModalProps) {
  const { open, onOpenChange } = props;
  const router = useRouter();

  async function handleScan(value: string) {
    const isUrl = z.string().url();
    const result = isUrl.safeParse(value);
    if (!result.success) {
      toast("QR code incorrect");
      return;
    }
    onOpenChange(false);
    router.push(result.data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Scanner une demande
          </DialogTitle>
        </DialogHeader>
        <Scanner onScan={(result) => handleScan(result[0].rawValue)} />
      </DialogContent>
    </Dialog>
  );
}

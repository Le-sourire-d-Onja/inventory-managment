import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";

type ConfirmModalProps = React.ComponentProps<typeof DialogPrimitive.Root> & {
  children: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal(props: ConfirmModalProps) {
  const { onConfirm, onCancel, children, ...dialogProps } = props;

  return (
    <Dialog {...dialogProps}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Confirmation d'action
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            ⚠️ Cette pop-up vous demande de confirmer l'action que vous venez de
            déclencher. Attention, cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        {children}
        <div className="flex gap-4 justify-end">
          <Button variant="secondary" onClick={onCancel}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              dialogProps.onOpenChange(false);
            }}
          >
            Confirmer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

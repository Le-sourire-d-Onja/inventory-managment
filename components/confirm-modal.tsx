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
  /** Disables the confirmation while the request it triggers is in flight. */
  pending?: boolean;
  /** Keep the dialog open after confirming, e.g. to show a pending state. */
  closeOnConfirm?: boolean;
};

export default function ConfirmModal(props: ConfirmModalProps) {
  const {
    onConfirm,
    onCancel,
    children,
    pending = false,
    closeOnConfirm = true,
    ...dialogProps
  } = props;

  return (
    <Dialog {...dialogProps}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Confirmation d'action
          </DialogTitle>
          <DialogDescription className="text-left text-muted-foreground text-sm">
            ⚠️ Cette pop-up vous demande de confirmer l'action que vous venez de
            déclencher. Attention, cette action est irréversible.
          </DialogDescription>
        </DialogHeader>
        {children}
        <div className="flex gap-4 justify-end">
          <Button variant="secondary" onClick={onCancel} disabled={pending}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            disabled={pending}
            onClick={() => {
              onConfirm();
              if (closeOnConfirm) dialogProps.onOpenChange?.(false);
            }}
          >
            {pending ? "En cours…" : "Confirmer"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

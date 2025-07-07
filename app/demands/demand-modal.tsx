import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DemandEntity } from "../api/demands/entity/demand.entity";
import { DialogDescription } from "@radix-ui/react-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateDemandSchema } from "../api/demands/entity/update-demand.entity";
import { useEffect } from "react";
import { localeDateOptions } from "@/lib/utils";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { DemandStatus } from "@/lib/generated/prisma";
import { AssociationEntity } from "../api/associations/entity/association.entity";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ContainerSelector from "./container-selector";

export enum Permission {
  READ,
  WRITE,
}

type DemandModalProps = {
  data: DemandEntity | null;
  associations: AssociationEntity[];
  permission: Permission;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function DemandModal(props: DemandModalProps) {
  const { data, associations, open, onOpenChange, permission } = props;

  const form = useForm<z.infer<typeof updateDemandSchema>>({
    resolver: zodResolver(updateDemandSchema),
  });

  function resetForm() {
    form.reset({
      id: data?.id ?? undefined,
      status: data?.status ?? DemandStatus.IN_PROGRESS,
      associationID: data?.association.id ?? undefined,
      containers: data?.containers ?? [],
    });
  }

  useEffect(() => {
    resetForm();
  }, [data]);

  async function onSubmit(values: z.infer<typeof updateDemandSchema>) {
    const response = await fetch(`/api/demands`, {
      method: data ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (response.ok) {
      onOpenChange(false);
    } else {
      toast("Une erreur à s'est produite.", {
        description: response.status,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {!data
              ? "Nouvelle demande"
              : `Demande pour ${data.association.name}`}{" "}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Créée le{" "}
            {!data
              ? new Date().toLocaleDateString("fr-FR", localeDateOptions)
              : data.createdAt.toLocaleDateString("fr-FR", localeDateOptions)}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="associationID"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Association
                    <span className="text-red-700"> * </span>
                  </FormLabel>
                  {permission !== Permission.WRITE ? (
                    <Input
                      readOnly
                      value={
                        associations.find((a) => a.id === field.value)?.name ??
                        ""
                      }
                    />
                  ) : (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Association" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {associations.map((association) => (
                          <SelectItem
                            key={association.id}
                            value={association.id}
                          >
                            {association.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <ContainerSelector form={form} permission={permission} />

            <Separator />
            {permission === Permission.WRITE && (
              <div className="flex justify-between">
                <Button
                  size="sm"
                  variant="link"
                  type="button"
                  className="text-xs text-destructive"
                  onClick={() => resetForm()}
                >
                  Réinitialiser
                </Button>
                <div className="flex gap-4 justify-end">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => onOpenChange(false)}
                  >
                    Annuler
                  </Button>
                  <Button variant="default" type="submit">
                    Sauvegarder
                  </Button>
                </div>
              </div>
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

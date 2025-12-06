import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AssociationDto } from "../api/associations/dto/association.dto";
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
import { Textarea } from "@/components/ui/textarea";
import { updateAssociationDtoSchema } from "../api/associations/dto/update-association.dto";
import { useEffect } from "react";
import { localeDateOptions } from "@/lib/utils";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { AssociationType } from "@/lib/generated/prisma";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export enum Permission {
  READ,
  WRITE,
}

type AssociationModalProps = {
  data: AssociationDto | null;
  permission: Permission;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function AssociationModal(props: AssociationModalProps) {
  const { data, open, onOpenChange, permission } = props;

  const form = useForm<z.infer<typeof updateAssociationDtoSchema>>({
    resolver: zodResolver(updateAssociationDtoSchema),
  });

  function resetForm() {
    form.reset({
      id: data?.id ?? undefined,
      name: data?.name ?? "",
      type: data?.type ?? AssociationType.ASSOCIATION,
      person_in_charge: data?.person_in_charge ?? "",
      address: data?.address ?? "",
      email: data?.email ?? "",
      phone: data?.phone ?? "",
      description: data?.description ?? "",
    });
  }

  useEffect(() => {
    resetForm();
  }, [data]);

  async function onSubmit(values: z.infer<typeof updateAssociationDtoSchema>) {
    const response = await fetch(`/api/associations`, {
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
            {!data ? "Nouvelle Association" : `Association de ${data.name}`}{" "}
          </DialogTitle>
          <DialogDescription className="text-left text-muted-foreground text-sm">
            Créée le{" "}
            {!data
              ? new Date().toLocaleDateString("fr-FR", localeDateOptions)
              : data.created_at.toLocaleDateString("fr-FR", localeDateOptions)}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <div className="flex gap-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>
                      Nom <span className="text-red-700"> * </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        readOnly={permission !== Permission.WRITE}
                        placeholder="Le Sourire d'Onja"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Type d'association
                      <span className="text-red-700"> * </span>
                    </FormLabel>
                    {permission !== Permission.WRITE ? (
                      <Input
                        readOnly
                        {...field}
                        value={AssociationDto.typeTxt(field.value)}
                      />
                    ) : (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Type d'association" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(AssociationType).map((type, i) => (
                            <SelectItem key={i} value={type}>
                              {AssociationDto.typeTxt(type)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="person_in_charge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Responsable <span className="text-red-700"> * </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      readOnly={permission !== Permission.WRITE}
                      placeholder="John Doe"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Email <span className="text-red-700"> * </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      readOnly={permission !== Permission.WRITE}
                      placeholder="john.doe@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Téléphone <span className="text-red-700"> * </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      readOnly={permission !== Permission.WRITE}
                      placeholder="+33695243465"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Adresse <span className="text-red-700"> * </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      readOnly={permission !== Permission.WRITE}
                      placeholder="21 rue du testeur, 16000 Angoulême"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel> Description </FormLabel>
                  <FormControl>
                    <Textarea
                      readOnly={permission !== Permission.WRITE}
                      placeholder="Ceci est une description..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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

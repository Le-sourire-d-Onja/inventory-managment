import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DonationEntity } from "../api/donations/entity/donation.entity";
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
import { ArticleSelector } from "@/components/article-selector";
import { updateDonationSchema } from "../api/donations/entity/update-donation.entity";
import { useEffect } from "react";
import { localeDateOptions } from "@/lib/utils";
import { toast } from "sonner";

export enum Permission {
  READ,
  WRITE,
}

type DonationModalProps = {
  data: DonationEntity | null;
  permission: Permission;
  onOpenChange: (open: boolean) => void;
};

export default function DonationModal(props: DonationModalProps) {
  const { data, onOpenChange, permission } = props;

  const form = useForm<z.infer<typeof updateDonationSchema>>({
    resolver: zodResolver(updateDonationSchema),
  });

  useEffect(() => {
    form.reset({
      id: data?.id ?? undefined,
      name: data?.name ?? "",
      description: data?.description ?? undefined,
      email: data?.email ?? undefined,
      phone: data?.phone ?? undefined,
      articles: data?.articles ?? [],
      articlesIDToRemove: [],
    });
  }, [data]);

  async function onSubmit(values: z.infer<typeof updateDonationSchema>) {
    const response = await fetch(`/api/donations`, {
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
    <Dialog open={data !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {!data ? "Nouvelle Donation" : `Donation de ${data.name}`}{" "}
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Nom <span className="text-red-700"> * </span>
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
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel> Email </FormLabel>
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
                  <FormLabel> Téléphone </FormLabel>
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

            <ArticleSelector form={form} permission={permission} />

            {permission === Permission.WRITE && (
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
            )}
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

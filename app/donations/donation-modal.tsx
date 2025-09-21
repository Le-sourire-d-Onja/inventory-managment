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
import { ArticleSelector } from "@/app/donations/article-selector";
import { updateDonationSchema } from "../api/donations/entity/update-donation.entity";
import { useEffect } from "react";
import { localeDateOptions } from "@/lib/utils";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export enum Permission {
  READ,
  WRITE,
}

type DonationModalProps = {
  data: DonationEntity | null;
  permission: Permission;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function DonationModal(props: DonationModalProps) {
  const { data, open, onOpenChange, permission } = props;

  const form = useForm<z.infer<typeof updateDonationSchema>>({
    resolver: zodResolver(updateDonationSchema),
  });

  function resetForm() {
    form.reset({
      id: data?.id ?? undefined,
      description: data?.description ?? "",
      articles:
        data?.articles.map((article) => ({
          quantity: article.quantity,
          typeID: article.type.id,
        })) ?? [],
      articlesIDToRemove: [],
    });
  }

  useEffect(() => {
    resetForm();
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {!data ? "Nouvelle Donation" : "Donation"}
          </DialogTitle>
          <DialogDescription className="text-left text-muted-foreground text-sm">
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

            <ArticleSelector data={data} form={form} permission={permission} />

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

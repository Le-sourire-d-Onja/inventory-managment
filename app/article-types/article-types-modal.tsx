import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArticleTypeEntity } from "../api/article-types/entity/article-types.entity";
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
import { useEffect } from "react";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { updateArticleTypeSchema } from "../api/article-types/entity/update-article-type.entity";
import { FloatInput } from "@/components/ui/float-input";

export enum Permission {
  READ,
  WRITE,
}

type ArticleTypeModalProps = {
  data: ArticleTypeEntity | null;
  permission: Permission;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ArticleTypeModal(props: ArticleTypeModalProps) {
  const { data, open, onOpenChange, permission } = props;

  const form = useForm<z.infer<typeof updateArticleTypeSchema>>({
    resolver: zodResolver(updateArticleTypeSchema),
  });

  function resetForm() {
    form.reset({
      id: data?.id ?? undefined,
      name: data?.name ?? "",
      weight: data?.weight ?? 0,
      volume: data?.volume ?? 0,
    });
  }

  useEffect(() => {
    resetForm();
  }, [data]);

  async function onSubmit(values: z.infer<typeof updateArticleTypeSchema>) {
    const response = await fetch(`/api/article-types`, {
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
            {!data ? "Nouvelle type d'article" : `Type d'article ${data.name}`}{" "}
          </DialogTitle>
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
              name="weight"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Poids <span className="text-red-700"> * </span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FloatInput
                        readOnly={permission !== Permission.WRITE}
                        placeholder="0.0"
                        field={field}
                      />
                      <span
                        className="absolute top-[18px] right-1.5
                     translate-[-50%]"
                      >
                        kg
                      </span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="volume"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Volume <span className="text-red-700"> * </span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FloatInput
                        readOnly={permission !== Permission.WRITE}
                        placeholder="0.0"
                        field={field}
                      />
                      <span
                        className="absolute top-[18px] right-1.5
                     translate-[-50%]"
                      >
                        m³
                      </span>
                    </div>
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

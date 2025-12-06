import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import {
  Form,
  FormControl,
  FormDescription,
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
import { PackagingType } from "@/lib/generated/prisma";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StockEntity } from "../api/stocks/entity/stock.entity";
import { ContainerDto } from "../api/containers/dto/container.dto";
import { updateContainerDtoSchema } from "../api/containers/dto/update-container.dto";
import ContentSelector from "./content-selector";
import { DemandDto } from "../api/demands/dto/demand.dto";
import { Separator } from "@/components/ui/separator";

export enum Permission {
  READ,
  WRITE,
}

type ContainerModal = {
  data: ContainerDto | null;
  stocks: StockEntity[];
  permission: Permission;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ContainerModal(props: ContainerModal) {
  const { data, stocks, open, onOpenChange, permission } = props;
  const form = useForm<z.infer<typeof updateContainerDtoSchema>>({
    resolver: zodResolver(updateContainerDtoSchema),
  });

  function resetForm() {
    form.reset({
      id: data?.id ?? undefined,
      packaging: data?.packaging ?? PackagingType.NONE,
      contents: data?.contents.map((content) => ({
        ...content,
        type_id: content.type.id,
      })) ?? [],
    });
  }

  useEffect(() => {
    resetForm();
  }, [data]);

  async function onSubmit(values: z.infer<typeof updateContainerDtoSchema>) {
    const response = await fetch((`/api/containers`), {
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
          <DialogTitle className="flex items-center gap-2">
            {!data ? "Nouveau contenant" : (`Contenant N°${data.id}`)}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-end">
                <FormField
                  control={form.control}
                  name="packaging"
                  render={({ field: selectField }) => (
                    <FormItem>
                      {permission !== Permission.WRITE ? (
                        <Input readOnly {...selectField} />
                      ) : (
                        <Select
                          onValueChange={selectField.onChange}
                          defaultValue={selectField.value}
                        >
                          <FormControl>
                            <SelectTrigger className="min-w-[150px]">
                              <SelectValue placeholder="Type de contenant" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.values(PackagingType).map((type, i) => (
                              <SelectItem key={i} value={type}>
                                {DemandDto.packagingTxt(type)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="relative min-w-[50px]">
                  <Input disabled value={data?.weight ?? 0} />
                  <span
                    className="opacity-25 absolute top-[18px] right-1.5
                      translate-[-50%]"
                  >
                    kg
                  </span>
                </div>

                <div className="relative min-w-[50px]">
                  <Input disabled value={data?.volume ?? 0} />
                  <span
                    className="opacity-25 absolute top-[18px] right-1.5
                      translate-[-50%]"
                  >
                    m³
                  </span>
                </div>
              </div>

              <ContentSelector
                stocks={stocks}
                form={form}
                permission={permission}
              />
            </div>

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

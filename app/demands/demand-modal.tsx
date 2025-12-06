import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DemandDto } from "../api/demands/dto/demand.dto";
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
import { updateDemandDtoSchema } from "../api/demands/dto/update-demand.entity";
import { useEffect } from "react";
import { localeDateOptions } from "@/lib/utils";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { DemandStatus } from "@/lib/generated/prisma";
import { AssociationDto } from "../api/associations/dto/association.dto";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ContainerSelector from "./container-selector";
import { Badge } from "@/components/ui/badge";
import { StockEntity } from "../api/stocks/entity/stock.entity";
import { generatePdf } from "@/lib/pdf";
import { ContainerDto } from "../api/containers/dto/container.dto";

export enum Permission {
  READ,
  WRITE,
}

type DemandModalProps = {
  data: DemandDto | null;
  stocks: StockEntity[];
  associations: AssociationDto[];
  containers: ContainerDto[];
  permission: Permission;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  refetch: () => void;
};

export default function DemandModal(props: DemandModalProps) {
  const { data, stocks, associations, containers, open, onOpenChange, permission, refetch } = props;
  const statusTxt = DemandDto.statusData(data?.status);
  const form = useForm<z.infer<typeof updateDemandDtoSchema>>({
    resolver: zodResolver(updateDemandDtoSchema),
  });

  function resetForm() {
    form.reset({
      id: data?.id ?? undefined,
      status: data?.status ?? DemandStatus.IN_PROGRESS,
      association_id: data?.association.id ?? undefined,
      containers:
        data?.containers.map((container) => ({
          ...container,
          contents: container.contents.map((content) => ({
            ...content,
            type_id: content.type.id,
          })),
        })) ?? [],
    });
  }

  useEffect(() => {
    resetForm();
  }, [data]);

  useEffect(() => {
    console.log(form.formState.errors)
  }, [form.formState.errors])

  async function onDownload(id: string) {
    const demand = form.getValues();
    const container = demand.containers?.find(
      (container) => container.id === id
    );
    if (!container) {
      throw new Error("Container not found");
    }
    const pdfInfos = {
      demand_id: data?.id ?? "",
      container_id: container.id ?? "",
      associationName:
        associations.find(
          (association) => association.id === demand.association_id
        )?.name ?? "Inconnue",
      contents: container.contents?.map((content) => ({
        name:
          stocks.find((stock) => stock.type.id === content.type_id)?.type.name ??
          "Inconnu",
        quantity: content.quantity,
      })) ?? [],
    };
    const pdfBase64 = await generatePdf([pdfInfos]);
    var link = document.createElement("a"); //Create <a>
    link.href = "data:application/pdf;base64," + pdfBase64; //Image Base64 Goes here
    link.download = "etiquette.pdf"; //File name Here
    link.click();
  }

  async function onSubmit(values: z.infer<typeof updateDemandDtoSchema>) {
    const response = await fetch("/api/demands", {
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
            {!data
              ? "Nouvelle demande"
              : (`Demande pour ${data.association.name}`)}
            {data?.status === DemandStatus.VALIDATED && (
              <Badge className={`${statusTxt.color}`}>{statusTxt.text}</Badge>
            )}
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
            className="flex flex-col gap-6"
          >
            <FormField
              control={form.control}
              name="association_id"
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

            <ContainerSelector
              data={data?.containers ?? []}
              stocks={stocks}
              containers={containers}
              onDownload={onDownload}
              form={form}
              permission={permission}
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

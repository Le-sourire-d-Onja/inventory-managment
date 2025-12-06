"use client";

import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Trash } from "lucide-react";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Permission } from "@/app/demands/demand-modal";
import z from "zod";
import { updateDemandDtoSchema } from "@/app/api/demands/dto/update-demand.entity";
import { PackagingType } from "@/lib/generated/prisma";
import ContentSelector from "./content-selector";
import { scrollBar } from "@/constants/tailwind";
import { ContainerDto } from "../api/containers/dto/container.dto";
import { DemandDto } from "../api/demands/dto/demand.dto";
import { StockEntity } from "../api/stocks/entity/stock.entity";
import { Separator } from "@radix-ui/react-separator";

interface ContainerSelectorProps {
  data: ContainerDto[];
  stocks: StockEntity[];
  onDownload: (id: string) => void;
  form: UseFormReturn<z.infer<typeof updateDemandDtoSchema>>;
  permission: Permission;
}

export default function ContainerSelector(props: ContainerSelectorProps) {
  const { data, stocks, onDownload, form, permission } = props;
  const control = form.control;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "containers",
    keyName: "fieldID",
  });

  function onAdd() {
    append({
      packaging: PackagingType.CARDBOARD,
      contents: [],
    });
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Contenants</h3>
        {permission === Permission.WRITE && (
          <Button type="button" size="sm" variant="outline" onClick={onAdd}>
            Ajouter un contenant
          </Button>
        )}
      </div>
      <div
        className={`overflow-y-scroll max-h-[450px] space-y-8 pr-2 ${scrollBar}`}
      >
        {fields.map((field, index) => (
          <div key={field.fieldID} className="flex flex-col gap-4 ">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 items-end">
                <FormField
                  control={control}
                  name={`containers.${index}.packaging`}
                  render={({ field: selectField }) => (
                    <FormItem>
                      {field.id && (
                        <FormDescription className="ml-2 text-sm text-muted-foreground">
                          N°{field.id}
                        </FormDescription>
                      )}
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
                  <Input disabled value={data[index]?.weight ?? 0} />
                  <span
                    className="opacity-25 absolute top-[18px] right-1.5
                     translate-[-50%]"
                  >
                    kg
                  </span>
                </div>
                <div className="relative min-w-[50px]">
                  <Input disabled value={data[index]?.volume ?? 0} />
                  <span
                    className="opacity-25 absolute top-[18px] right-1.5
                     translate-[-50%]"
                  >
                    m³
                  </span>
                </div>
                {field.id && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onDownload(field.id!)}
                  >
                    <Download size={30} />
                  </Button>
                )}
                {permission === Permission.WRITE && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      remove(index);
                    }}
                  >
                    <Trash className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </div>

            <ContentSelector
              prevIndex={index}
              stocks={stocks}
              form={form}
              permission={permission}
            />
            <Separator />
          </div>
        ))}
      </div>
    </div>
  );
}

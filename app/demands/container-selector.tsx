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
import { Trash } from "lucide-react";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Permission } from "@/app/demands/demand-modal";
import z from "zod";
import { updateDemandSchema } from "@/app/api/demands/entity/update-demand.entity";
import { PackagingType } from "@/lib/generated/prisma";
import ContentSelector from "./content-selector";
import { scrollBar } from "@/constants/tailwind";
import { FloatInput } from "@/components/ui/float-input";

interface ContainerSelectorProps {
  form: UseFormReturn<z.infer<typeof updateDemandSchema>>;
  permission: Permission;
}

export default function ContainerSelector(props: ContainerSelectorProps) {
  const { form, permission } = props;
  const control = form.control;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "containers",
    keyName: "fieldID",
  });

  const addContainer = () => {
    append({
      volume: 0,
      weight: 0,
      packaging: PackagingType.CARDBOARD,
      contents: [],
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Contenants</h3>
        {permission === Permission.WRITE && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addContainer}
          >
            Ajouter un contenant
          </Button>
        )}
      </div>

      <div
        className={`overflow-y-scroll max-h-[450px] space-y-8 pr-2 ${scrollBar}`}
      >
        {fields.map((field, index) => (
          <div key={field.fieldID} className="flex flex-col gap-4 ">
            <div className="flex gap-2 items-center">
              <FormField
                control={control}
                name={`containers.${index}.packaging`}
                render={({ field }) => (
                  <FormItem>
                    {permission !== Permission.WRITE ? (
                      <Input readOnly {...field} />
                    ) : (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="min-w-[150px]">
                            <SelectValue placeholder="Type de contenant" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.values(PackagingType).map((type, i) => (
                            <SelectItem key={i} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`containers.${index}.weight`}
                render={({ field }) => (
                  <FormItem className="relative">
                    <div key={index}>
                      <FloatInput
                        readOnly={permission !== Permission.WRITE}
                        placeholder="Poids"
                        field={field}
                      />
                      <span
                        className="absolute top-[18px] right-1.5
                                     translate-[-50%]"
                      >
                        kg
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`containers.${index}.volume`}
                render={({ field }) => (
                  <FormItem className="relative">
                    <div key={index}>
                      <FloatInput
                        readOnly={permission !== Permission.WRITE}
                        placeholder="Volume"
                        field={field}
                      />
                      <span
                        className="absolute top-[18px] right-1.5
                                               translate-[-50%]"
                      >
                        m³
                      </span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            <ContentSelector
              prevIndex={index}
              form={form}
              permission={permission}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

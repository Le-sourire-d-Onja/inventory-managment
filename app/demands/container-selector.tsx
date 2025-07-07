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
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Conteneurs</h3>
        {permission === Permission.WRITE && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addContainer}
          >
            Ajouter un conteneur
          </Button>
        )}
      </div>

      {fields.map((field, index) => (
        <div key={index} className="flex flex-col gap-4">
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
                          <SelectValue placeholder="Type de conteneur" />
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
                    <Input
                      readOnly={permission !== Permission.WRITE}
                      type="number"
                      placeholder="Poids"
                      min={0}
                      step={0.01}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 1)
                      }
                    />
                    <span
                      className="absolute top-[50%] right-1.5
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
                    <Input
                      readOnly={permission !== Permission.WRITE}
                      type="number"
                      placeholder="Volume"
                      min={0}
                      step={0.01}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 1)
                      }
                    />
                    <span
                      className="absolute top-[50%] right-1.5
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
  );
}

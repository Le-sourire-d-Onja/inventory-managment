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
import { CornerDownRight, Plus, Trash } from "lucide-react";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Permission } from "@/app/demands/demand-modal";
import z from "zod";
import { updateDemandSchema } from "@/app/api/demands/entity/update-demand.entity";
import { ArticleType } from "@/lib/generated/prisma";
import { StockEntity } from "../api/stocks/entity/stock.entity";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { DotLoader, MoonLoader } from "react-spinners";

interface ContentSelectorProps {
  prevIndex: number;
  form: UseFormReturn<z.infer<typeof updateDemandSchema>>;
  permission: Permission;
}

export default function ContentSelector(props: ContentSelectorProps) {
  const [stocks, setStocks] = useState<StockEntity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [types, setTypes] = useState<ArticleType[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<ArticleType[]>([]);
  const { prevIndex, form, permission } = props;
  const control = form.control;
  const { fields, append, remove } = useFieldArray({
    control,
    name: `containers.${prevIndex}.contents`,
    keyName: "fieldID",
  });

  async function retrieveStocks() {
    setIsLoading(true);
    fetch(`/api/stocks?types=${JSON.stringify(types)}`)
      .then((res) => {
        if (res.status === 200) return res.json();
        throw res;
      })
      .then((res) => {
        setStocks(res);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  function retrieveTypes() {
    const contents = form.getValues(`containers.${prevIndex}.contents`);
    setTypes(Array.from(new Set(contents?.map((c) => c.type))));
  }

  function retrieveFilteredTypes() {
    const test = Object.values(ArticleType).filter(
      (type) => !types.includes(type)
    );
    setFilteredTypes(test);
  }

  useEffect(() => {
    retrieveStocks();
    retrieveFilteredTypes();
  }, [types]);

  useEffect(() => {
    retrieveTypes();
  }, [form.getValues(`containers.${prevIndex}.contents`)]);

  const addContent = () => {
    append({
      type: filteredTypes[0],
      quantity: 0,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {fields.map((field, index) => {
        const type = form.getValues(
          `containers.${prevIndex}.contents.${index}.type`
        );
        const stock = stocks?.find((stock) => stock.type === type);
        return (
          <div key={index} className="flex gap-8 ml-4">
            <CornerDownRight className="m-0" />
            <FormField
              control={control}
              name={`containers.${prevIndex}.contents.${index}.type`}
              render={({ field }) => (
                <FormItem>
                  {permission !== Permission.WRITE ? (
                    <Input readOnly {...field} />
                  ) : (
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        retrieveTypes();
                        retrieveFilteredTypes();
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="min-w-[150px]">
                          <SelectValue placeholder="Type d'article" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {[...new Set([...filteredTypes, field.value])].map(
                          (type, i) => {
                            return (
                              <SelectItem key={i} value={type}>
                                {type}
                              </SelectItem>
                            );
                          }
                        )}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`containers.${prevIndex}.contents.${index}.quantity`}
              render={({ field }) => (
                <FormItem className="relative">
                  {!isLoading ? (
                    <div key={index}>
                      <div>
                        <Input
                          readOnly={permission !== Permission.WRITE}
                          type="number"
                          placeholder="Quantité"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </div>
                      <span
                        className="absolute top-[18px] right-1.5
                                     translate-[-50%]"
                      >
                        #
                      </span>
                    </div>
                  ) : (
                    <div className="flex w-full items-center">
                      <MoonLoader size={20} color="var(--color-foreground)" />
                    </div>
                  )}

                  {!isLoading && permission === Permission.WRITE && (
                    <FormDescription>
                      {stock && stock.quantity > 0 ? stock.quantity : 0}{" "}
                      disponible
                    </FormDescription>
                  )}
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
        );
      })}
      {permission === Permission.WRITE && filteredTypes.length !== 0 && (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="ml-2"
          onClick={addContent}
        >
          <Plus />
        </Button>
      )}
    </div>
  );
}

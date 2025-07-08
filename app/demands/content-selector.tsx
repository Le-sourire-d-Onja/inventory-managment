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
  const [articleTypes, setArticleTypes] = useState<ArticleType[]>([]);
  const [currArticleTypes, setCurrArticleTypes] = useState<ArticleType[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<ArticleType[]>([]);
  const { prevIndex, form, permission } = props;
  const control = form.control;
  const { fields, append, remove } = useFieldArray({
    control,
    name: `containers.${prevIndex}.contents`,
    keyName: "fieldID",
  });

  async function retrieveArticleTypes() {
    setIsLoading(true);
    fetch("/api/article-types")
      .then((res) => {
        if (res.status === 200) return res.json();
        throw res;
      })
      .then((res) => setArticleTypes(res))
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false));
  }

  async function retrieveStocks() {
    setIsLoading(true);
    fetch(`/api/stocks?types=${JSON.stringify(currArticleTypes)}`)
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

  function retrieveCurrentArticleTypes() {
    const contents = form.getValues(`containers.${prevIndex}.contents`);
    setCurrArticleTypes(Array.from(new Set(contents?.map((c) => c.typeID))));
  }

  function retrieveFilteredTypes() {
    setFilteredTypes(
      articleTypes.filter((type) => !currArticleTypes.includes(type))
    );
  }

  useEffect(() => {
    retrieveStocks();
    retrieveFilteredTypes();
  }, [currArticleTypes, articleTypes]);

  useEffect(() => {
    retrieveCurrentArticleTypes();
    retrieveArticleTypes();
  }, [form.getValues(`containers.${prevIndex}.contents`)]);

  const addContent = () => {
    append({
      typeID: filteredTypes[0].id,
      quantity: 0,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {fields.map((field, index) => {
        const stock = stocks?.find((stock) => stock.type === field.type);
        const selectedTypes = form
          .getValues(`containers.${prevIndex}.contents`)
          ?.map<string | null>((c, i) => (i !== index ? c.typeID : null));

        const availableTypes = articleTypes.filter(
          (type) => !selectedTypes.includes(type.id) || type.id === field.typeID
        );
        return (
          <div key={field.fieldID} className="flex gap-8 ml-4">
            <CornerDownRight className="m-0" />
            <FormField
              control={control}
              name={`containers.${prevIndex}.contents.${index}.type`}
              render={({ field }) => {
                console.log(field.value);
                return (
                  <FormItem>
                    {permission !== Permission.WRITE ? (
                      <Input readOnly {...field} />
                    ) : (
                      <Select
                        onValueChange={(value) => field.onChange(value)}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="min-w-[150px]">
                            <SelectValue placeholder="Type d'article" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableTypes.map((type, i) => {
                            return (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    )}
                    <FormMessage />
                  </FormItem>
                );
              }}
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

      {permission === Permission.WRITE && filteredTypes.length > 0 && (
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

      {articleTypes.length <= 0 && (
        <p className="self-center text-destructive text-sm">
          Veuillez ajouter au moins un type d'article
        </p>
      )}
    </div>
  );
}

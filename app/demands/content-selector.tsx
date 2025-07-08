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
import { PulseLoader } from "react-spinners";

interface ContentSelectorProps {
  prevIndex: number;
  form: UseFormReturn<z.infer<typeof updateDemandSchema>>;
  permission: Permission;
}

export default function ContentSelector(props: ContentSelectorProps) {
  const [stocks, setStocks] = useState<StockEntity[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [articleTypes, setArticleTypes] = useState<ArticleType[]>([]);
  const [currArticleTypeIDs, setCurrArticleTypeIDs] = useState<string[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<ArticleType[]>([]);
  const { prevIndex, form, permission } = props;
  const control = form.control;
  const { fields, append, remove } = useFieldArray({
    control,
    name: `containers.${prevIndex}.contents`,
    keyName: "fieldID",
  });
  const watchedContents = form.watch(`containers.${prevIndex}.contents`);

  async function retrieveArticleTypes() {
    setIsLoading(true);
    fetch("/api/article-types")
      .then((res) => {
        if (res.ok) return res.json();
        throw res;
      })
      .then((res) => setArticleTypes(res))
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false));
  }

  async function retrieveStocks() {
    setIsLoading(true);
    fetch(`/api/stocks?types=${JSON.stringify(currArticleTypeIDs)}`)
      .then((res) => {
        if (res.ok) return res.json();
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
    setCurrArticleTypeIDs(
      Array.from(new Set(watchedContents.map((c) => c.typeID)))
    );
  }

  function retrieveFilteredTypes() {
    setFilteredTypes(
      articleTypes.filter((type) => !currArticleTypeIDs.includes(type.id))
    );
  }

  useEffect(() => {
    retrieveStocks();
    retrieveFilteredTypes();
  }, [currArticleTypeIDs, articleTypes]);

  useEffect(() => {
    retrieveArticleTypes();
  }, []);

  useEffect(() => {
    retrieveCurrentArticleTypes();
  }, [watchedContents]);

  const addContent = () => {
    append({
      typeID: filteredTypes[0].id,
      quantity: 0,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {fields.map((field, index) => {
        const stock = stocks?.find((stock) => stock.type.id === field.typeID);
        const selectedTypes = form
          .getValues(`containers.${prevIndex}.contents`)
          ?.filter((_, i) => i !== index)
          .map<string>((c) => c.typeID);

        const availableTypes = articleTypes.filter(
          (type) => !selectedTypes.includes(type.id) || type.id === field.typeID
        );
        return (
          <div key={field.fieldID} className="flex gap-2 ml-4">
            <CornerDownRight size={40} className="mr-4" />
            <FormField
              control={control}
              name={`containers.${prevIndex}.contents.${index}.typeID`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  {permission !== Permission.WRITE ? (
                    <Input readOnly {...field} />
                  ) : (
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        retrieveCurrentArticleTypes();
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="min-w-[225px]">
                          <SelectValue placeholder="Type d'article" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableTypes.map((type, i) => {
                          return (
                            <SelectItem key={i} value={type.id}>
                              {type.name}
                            </SelectItem>
                          );
                        })}
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

                  {permission === Permission.WRITE &&
                    (!isLoading ? (
                      <FormDescription className="whitespace-nowrap">
                        {stock && stock.quantity > 0 ? stock.quantity : 0}{" "}
                        disponible
                      </FormDescription>
                    ) : (
                      <div className="flex ml-2">
                        <PulseLoader size={5} color="var(--color-foreground)" />
                      </div>
                    ))}
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

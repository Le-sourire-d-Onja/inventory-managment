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
import { ArticleTypeEntity } from "../api/article-types/entity/article-types.entity";

interface ContentSelectorProps {
  prevIndex: number;
  stocks: StockEntity[];
  form: UseFormReturn<z.infer<typeof updateDemandSchema>>;
  permission: Permission;
}

export default function ContentSelector(props: ContentSelectorProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [articleTypes, setArticleTypes] = useState<ArticleType[]>([]);
  const [currArticleTypeIDs, setCurrArticleTypeIDs] = useState<string[]>([]);
  const [filteredTypes, setFilteredTypes] = useState<ArticleType[]>([]);
  const { stocks, prevIndex, form, permission } = props;
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
      .then((res) => res.map((obj: any) => ArticleTypeEntity.parse(obj)))
      .then((data) => setArticleTypes(data))
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false));
  }

  function retrieveCurrentArticleTypes() {
    setCurrArticleTypeIDs(
      Array.from(new Set(watchedContents.map((c) => c.type_id)))
    );
  }

  function retrieveFilteredTypes() {
    setFilteredTypes(
      articleTypes.filter((type) => !currArticleTypeIDs.includes(type.id))
    );
  }

  useEffect(() => {
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
      type_id: filteredTypes[0].id,
      quantity: 0,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {fields.map((field, index) => {
        const stock = stocks.find((stock) => stock.type.id === field.type_id);
        const selectedTypes = form
          .getValues(`containers.${prevIndex}.contents`)
          ?.filter((_, i) => i !== index)
          .map<string>((c) => c.type_id);

        const availableTypes = articleTypes.filter(
          (type) => !selectedTypes.includes(type.id) || type.id === field.type_id
        );
        return (
          <div key={field.fieldID} className="flex gap-2 ml-4">
            <CornerDownRight size={30} className="mr-4 mt-1" />
            <FormField
              control={control}
              name={`containers.${prevIndex}.contents.${index}.type_id`}
              render={({ field }) => (
                <FormItem>
                  {permission !== Permission.WRITE ? (
                    <Input
                      className="overflow-ellipsis w-[225px]"
                      readOnly
                      {...field}
                      value={
                        availableTypes.find(
                          (availableType) => availableType.id === field.value
                        )?.name ?? "Inconnu"
                      }
                    />
                  ) : (
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        retrieveCurrentArticleTypes();
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="overflow-ellipsis w-[225px]">
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
                        placeholder="Quantité"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ""
                              ? ""
                              : parseInt(e.target.value)
                          )
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

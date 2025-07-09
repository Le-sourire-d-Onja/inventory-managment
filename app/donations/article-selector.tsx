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
import { ArticleType } from "@/lib/generated/prisma";
import { Permission } from "@/app/donations/donation-modal";
import z from "zod";
import { updateDonationSchema } from "@/app/api/donations/entity/update-donation.entity";
import { useEffect, useState } from "react";
import { MoonLoader } from "react-spinners";
import { scrollBar } from "@/constants/tailwind";
import { FloatInput } from "@/components/ui/float-input";

interface ArticleSelectorProps {
  form: UseFormReturn<z.infer<typeof updateDonationSchema>>;
  permission: Permission;
}

export function ArticleSelector(props: ArticleSelectorProps) {
  const [articleTypes, setArticleTypes] = useState<ArticleType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { form, permission } = props;
  const control = form.control;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "articles",
    keyName: "fieldID",
  });

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

  useEffect(() => {
    retrieveArticleTypes();
  }, []);

  const addArticle = () => {
    append({
      typeID: articleTypes[0].id,
      quantity: 1,
      value: 1,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Articles</h3>
        {permission === Permission.WRITE && (
          <Button
            disabled={
              articleTypes.length <= 0 ||
              form.getValues("articles").length >= articleTypes.length
            }
            type="button"
            size="sm"
            variant="outline"
            onClick={addArticle}
          >
            Ajouter un article
          </Button>
        )}
      </div>

      {articleTypes.length <= 0 && (
        <p className="self-center text-destructive text-sm">
          Veuillez ajouter au moins un type d'article
        </p>
      )}

      <div
        className={`overflow-y-scroll max-h-[300px] space-y-8 pr-2 ${scrollBar}`}
      >
        {fields.map((field, index) => {
          const selectedTypes = form
            .getValues("articles")
            ?.filter((_, i) => i !== index)
            .map((a) => a.typeID);

          const availableTypes = articleTypes.filter(
            (type) =>
              !selectedTypes.includes(type.id) || type.id === field.typeID
          );
          return (
            <div key={index} className="flex gap-2 items-center">
              <FormField
                control={control}
                name={`articles.${index}.typeID`}
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
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="overflow-ellipsis w-[225px]">
                            <SelectValue placeholder="Type d'article" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {!isLoading ? (
                            availableTypes.map((type) => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.name}
                              </SelectItem>
                            ))
                          ) : (
                            <MoonLoader
                              size={20}
                              color="var(--color-foreground)"
                            />
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
                name={`articles.${index}.quantity`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl className="relative min-w-[30px]">
                      <div key={index}>
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
                        <span
                          className="absolute top-[18px] right-1.5
                     translate-[-50%]"
                        >
                          #
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name={`articles.${index}.value`}
                render={({ field }) => (
                  <FormItem className="relative min-w-[50px]">
                    <FormControl>
                      <div key={index}>
                        <FloatInput
                          readOnly={permission !== Permission.WRITE}
                          placeholder="Prix"
                          field={field}
                        />
                        <span
                          className="absolute top-[18px] right-1.5
                     translate-[-50%]"
                        >
                          €
                        </span>
                      </div>
                    </FormControl>
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
                    if (field.id) {
                      form.setValue("articlesIDToRemove", [
                        ...form.getValues("articlesIDToRemove"),
                        field.id,
                      ]);
                    }
                    remove(index);
                  }}
                >
                  <Trash className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

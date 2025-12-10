import { useFieldArray, UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash } from "lucide-react";
import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Permission } from "@/app/donations/donation-modal";
import z from "zod";
import { updateDonationDtoSchema } from "@/app/api/donations/dto/update-donation.entity";
import { useEffect, useState } from "react";
import { scrollBar } from "@/constants/tailwind";
import { ArticleTypeDto } from "../api/article-types/dto/article-types.dto";
import Combobox from "@/components/ui/combobox";

interface ArticleSelectorProps {
  form: UseFormReturn<z.infer<typeof updateDonationDtoSchema>>;
  permission: Permission;
}

export function ArticleSelector(props: ArticleSelectorProps) {
  const [articleTypes, setArticleTypes] = useState<ArticleTypeDto[]>([]);
  const { form, permission } = props;
  const control = form.control;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "articles",
    keyName: "fieldID",
  });

  async function retrieveArticleTypes() {
    fetch("/api/article-types")
      .then((res) => {
        if (res.ok) return res.json();
        throw res;
      })
      .then((res) => res.map((obj: any) => ArticleTypeDto.parse(obj)))
      .then((data) => setArticleTypes(data))
      .catch((err) => console.log(err));
  }

  useEffect(() => {
    retrieveArticleTypes();
  }, []);

  const addArticle = () => {
    append({
      type_id: "",
      quantity: 1,
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
            .map((a) => a.type_id);

          const availableTypes = articleTypes.filter(
            (type) =>
              !selectedTypes.includes(type.id) || type.id === field.type_id
          );
          return (
            <div key={index} className="flex gap-2 items-center">
              <FormField
                control={control}
                name={`articles.${index}.type_id`}
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
                      <Combobox
                        items={availableTypes.map((availableType) => ({ key: availableType.id, value: availableType.name }))}
                        defaultKey={field.value}
                        onChange={field.onChange}
                      />
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

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

interface ArticleSelectorProps {
  form: UseFormReturn<z.infer<typeof updateDonationSchema>>;
  permission: Permission;
}

export function ArticleSelector(props: ArticleSelectorProps) {
  const { form, permission } = props;
  const control = form.control;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "articles",
    keyName: "fieldID",
  });

  const addArticle = () => {
    append({
      type: ArticleType.DIAPERS,
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
            type="button"
            size="sm"
            variant="outline"
            onClick={addArticle}
          >
            Ajouter un article
          </Button>
        )}
      </div>

      {fields.map((field, index) => (
        <div key={index} className="flex gap-2 items-center">
          <FormField
            control={control}
            name={`articles.${index}.type`}
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
                        <SelectValue placeholder="Type d'article" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(ArticleType).map((type, i) => (
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
            name={`articles.${index}.quantity`}
            render={({ field }) => (
              <FormItem>
                <FormControl className="relative min-w-[30px]">
                  <div key={index}>
                    <Input
                      readOnly={permission !== Permission.WRITE}
                      type="number"
                      placeholder="Quantité"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 1)
                      }
                    />
                    <span
                      className="absolute top-[50%] right-1.5
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
                    <Input
                      readOnly={permission !== Permission.WRITE}
                      type="number"
                      placeholder="10"
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
      ))}
    </div>
  );
}

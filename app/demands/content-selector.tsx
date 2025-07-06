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

interface ContentSelectorProps {
  prevIndex: number;
  form: UseFormReturn<z.infer<typeof updateDemandSchema>>;
  permission: Permission;
}

export function ContentSelector(props: ContentSelectorProps) {
  const { prevIndex, form, permission } = props;
  const control = form.control;
  const { fields, append, remove } = useFieldArray({
    control,
    name: `containers.${prevIndex}.contents`,
    keyName: "fieldID",
  });

  const addContent = () => {
    append({
      type: ArticleType.DIAPERS,
      quantity: 1,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {fields.map((field, index) => (
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
            name={`containers.${prevIndex}.contents.${index}.quantity`}
            render={({ field }) => (
              <FormItem className="relative">
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
                    className="absolute top-[18px] right-1.5
                                     translate-[-50%]"
                  >
                    #
                  </span>
                </div>
                {/* TODO */}
                {/* {permission === Permission.WRITE && (
                  <FormDescription> 40 disponible </FormDescription>
                )} */}
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
      ))}
      {permission === Permission.WRITE && (
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

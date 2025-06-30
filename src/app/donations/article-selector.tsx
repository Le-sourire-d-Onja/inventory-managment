import { useFieldArray, Control, UseFormRegister, useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";
import { FormValues } from "./edit-donation-dialog";

interface ArticleSelectorProps {
    control: Control<FormValues>;
    register: UseFormRegister<FormValues>;
    articleTypes: Array<{ id: string; name: string }>;
}

export function ArticleSelector({ control, register, articleTypes }: ArticleSelectorProps) {
    const { fields, append, remove } = useFieldArray({
        control,
        name: "articles",
    });

    const form = useFormContext<FormValues>();

    const addArticle = () => {
        append({
            typeID: "",
            quantity: 1,
            value: 0
        });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium">Articles</h3>
                <Button type="button" size="sm" variant="outline" onClick={addArticle}>
                    Ajouter un article
                </Button>
            </div>

            {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-center">
                    <FormField
                        control={control}
                        name={`articles.${index}.typeID`}
                        render={({ field: formField }) => (
                            <FormItem>
                                <Select
                                    onValueChange={formField.onChange}
                                    defaultValue={formField.value}
                                >
                                    <FormControl>
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder="Type d'article" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {articleTypes.map((type) => (
                                            <SelectItem key={type.id} value={type.id}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name={`articles.${index}.quantity`}
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min="1"
                                        placeholder="Quantité"
                                        {...field}
                                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                        className="w-24"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={control}
                        name={`articles.${index}.value`}
                        render={({ field }) => (
                            <FormItem className="relative">
                                <FormControl>
                                    <>
                                        <span className="absolute left-3 top-2">€</span>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            placeholder="Valeur"
                                            {...field}
                                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                            className="w-32 pl-8"
                                        />
                                    </>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                    >
                        <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
            ))}
        </div>
    );
}
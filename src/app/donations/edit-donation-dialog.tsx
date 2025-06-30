"use client";

import { useState, useEffect } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

type FormData = z.infer<typeof formSchema>;
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArticleSelector } from "./article-selector";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Donation } from "@/generated/prisma";

export type ArticleFormData = {
    id?: string;
    typeID: string;
    quantity: number;
    value: number;
};

export type FormValues = {
    name: string;
    email: string;
    description: string;
    phone: string;
    articles: ArticleFormData[];
};

const formSchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    description: z.string().optional(),
    email: z.string().email("Une adresse email valide est requise"),
    phone: z.string()
        .regex(/^\+?[0-9\s-]*$/, "Numéro de téléphone invalide")
        .optional()
        .or(z.literal("")),
    articles: z.array(z.object({
        id: z.string().optional(),
        typeID: z.string().min(1, "Le type d'article est requis"),
        quantity: z.number().min(1, "La quantité doit être d'au moins 1"),
        value: z.number().min(0, "La valeur ne peut pas être négative")
    })).optional()
});


interface EditDonationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    donation: (Donation & {
        articles: Array<{
            typeID: string;
            quantity: number;
            value: number;
        }>;
    }) | null;
    articleTypes: Array<{ id: string; name: string }>;
    onSave: (data: FormValues) => Promise<void>;
    isSaving?: boolean;
}

export function EditDonationDialog({
    open,
    onOpenChange,
    donation,
    articleTypes,
    onSave,
    isSaving = false,
}: EditDonationDialogProps) {
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: "",
            description: "",
            email: "",
            phone: "",
            articles: [],
        } as FormValues,
    });

    // Mise à jour des valeurs du formulaire quand la donation change
    useEffect(() => {
        if (donation) {
            form.reset({
                name: donation.name,
                description: donation.description,
                email: donation.email,
                phone: donation.phone,
                articles: donation.articles.map(article => ({
                    typeID: article.typeID,
                    quantity: article.quantity,
                    value: article.value
                }))
            } as FormValues);
        } else {
            form.reset({
                name: "",
                description: "",
                email: "",
                phone: "",
                articles: []
            } as FormValues);
        }
    }, [donation, form]);

    const handleSubmit = async (data: any) => {
        await onSave(data as FormValues);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        {donation ? "Modifier la donation" : "Nouvelle donation"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }: { field: any }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1">
                                        Nom <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Nom de la donation" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }: { field: any }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Description de la donation"
                                            className="resize-none min-h-[100px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }: { field: any }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-1">
                                        Email <span className="text-red-500">*</span>
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="john.doe@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }: { field: any }) => (
                                <FormItem>
                                    <FormLabel>Téléphone</FormLabel>
                                    <FormControl>
                                        <Input placeholder="+33695243465" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        <div className="mt-4">
                            <ArticleSelector
                                control={form.control}
                                register={form.register}
                                articleTypes={articleTypes}
                            />
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSaving}
                            >
                                Annuler
                            </Button>
                            <Button type="submit" disabled={isSaving}>
                                {isSaving ? "Enregistrement..." : "Enregistrer"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

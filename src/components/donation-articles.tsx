// components/donation-articles.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { DonationWithArticles } from "@/app/donations/donations-client";

// Définir les colonnes pour la DataTable
const columns: ColumnDef<{
    type: string;
    quantity: number;
    value: number;
}>[] = [
        {
            accessorKey: "type",
            header: "Type d'article",
        },
        {
            accessorKey: "quantity",
            header: "Quantité",
            cell: ({ row }) => <div className="text-right">{row.getValue("quantity")}</div>,
        },
        {
            accessorKey: "value",
            header: "Valeur",
            cell: ({ row }) => {
                const value = parseFloat(row.getValue("value"));
                return <div className="text-right">{value.toFixed(2)} €</div>;
            },
        },
    ];

interface DonationArticlesProps {
    donation: DonationWithArticles;
}

export function DonationArticles({ donation }: DonationArticlesProps) {
    if (!donation.articles?.length) {
        return <p className="text-muted-foreground">Aucun article</p>;
    }

    // Préparer les données pour la DataTable
    const tableData = donation.articles.map((article) => ({
        type: article.type?.name || "Inconnu",
        quantity: article.quantity,
        value: article.value,
    }));

    // Calculer les totaux
    const totalQuantity = donation.articles.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = donation.articles.reduce((sum, item) => sum + item.value, 0);

    return (
        <div className="space-y-4">
            <div className="rounded-md border">
                <DataTable
                    columns={columns}
                    data={tableData}
                />
            </div>

            <div className="flex justify-end gap-8 pr-4">
                <div className="text-sm font-medium">
                    <span className="text-muted-foreground mr-2">Total articles:</span>
                    {totalQuantity}
                </div>
                <div className="text-sm font-medium">
                    <span className="text-muted-foreground mr-2">Valeur totale:</span>
                    {totalValue.toFixed(2)} €
                </div>
            </div>
        </div>
    );
}
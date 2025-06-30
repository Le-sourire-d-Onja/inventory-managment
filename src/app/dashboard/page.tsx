"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
    // Données factices pour les cartes de statistiques
    const stats = [
        { title: "Articles en stock", value: "1,234", change: "+12%" },
        { title: "Commandes ce mois", value: "89", change: "+5%" },
        { title: "Ventes totales", value: "24,567 €", change: "+8.2%" },
        { title: "Nouveaux clients", value: "45", change: "+15%" },
    ];

    return (
        <div className="flex-1 space-y-4 md:p-8 pt-6">
            <h2 className="text-3xl font-bold tracking-tight">Tableau de bord</h2>

            {/* Cartes de statistiques */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                className="h-4 w-4 text-muted-foreground"
                            >
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                            </svg>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <p className="text-xs text-muted-foreground">
                                {stat.change} par rapport au mois dernier
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Graphiques et tableaux */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Aperçu des ventes</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                            Graphique des ventes (à implémenter)
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Activité récente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            Commande #{1000 + i}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Client {i === 1 ? "Dupont" : i === 2 ? "Martin" : "Dubois"}
                                        </p>
                                    </div>
                                    <div className="text-sm font-medium">{i * 45} €</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Liste des articles à réapprovisionner */}
            <Card>
                <CardHeader>
                    <CardTitle>Articles à réapprovisionner</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        Article {i === 1 ? "A" : i === 2 ? "B" : "C"}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Stock restant: {i * 2} unités
                                    </p>
                                </div>
                                <Button variant="outline" size="sm">
                                    Commander
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

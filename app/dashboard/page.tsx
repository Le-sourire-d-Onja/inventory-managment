"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { Bar, BarChart, Cell, XAxis, YAxis } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, ClipboardList, Clock, Download, Gift, Inbox, Package, PackageOpen } from "lucide-react";
import { cn, formatEuro, formatVolume, formatWeight } from "@/lib/utils";

type StockRow = {
  name: string;
  quantity: number;
  volume: number;
  weight: number;
  value: number;
};

type StockRowInput = {
  type?: string | { name?: string } | null;
  quantity: number;
  volume: number;
  weight: number;
  value: number;
};

type StockUnit = {
  value: keyof Omit<StockRow, "name">;
  unit: string;
  label: string;
};

type DemandStatusRow = {
  status: string;
  count: number;
};

const stockUnits: StockUnit[] = [
  { value: "quantity", unit: "#", label: "Articles" },
  { value: "volume", unit: "m³", label: "Volume" },
  { value: "weight", unit: "kg", label: "Poids" },
  { value: "value", unit: "€", label: "Valeur" },
];

const demandStatuses: { key: string; label: string }[] = [
  { key: "IN_PROGRESS", label: "En attente" },
  { key: "CONTAINERIZED", label: "Empotée" },
  { key: "DISTRIBUTED", label: "Distribuée" },
];

function toStockRow(raw: StockRowInput): StockRow {
  const name = typeof raw.type === "string" ? raw.type : (raw.type?.name ?? "—");
  return {
    name,
    quantity: raw.quantity,
    volume: raw.volume,
    weight: raw.weight,
    value: raw.value,
  };
}

function formatByUnit(value: number, unit: StockUnit): string {
  switch (unit.value) {
    case "value":
      return formatEuro(value);
    case "weight":
      return `${formatWeight(value)} kg`;
    case "volume":
      return `${formatVolume(value)} m³`;
    default:
      return formatWeight(value);
  }
}

function chartColor(index: number): string {
  return `var(--chart-${(index % 5) + 1})`;
}

function sumTotals(rows: StockRow[]) {
  return rows.reduce(
    (acc, row) => ({
      quantity: acc.quantity + row.quantity,
      weight: acc.weight + row.weight,
      volume: acc.volume + row.volume,
      value: acc.value + row.value,
    }),
    { quantity: 0, weight: 0, volume: 0, value: 0 },
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tint: string;
}) {
  return (
    <Card className="gap-2 py-5">
      <CardHeader className="px-5">
        <div className="flex items-center justify-between gap-2">
          <CardDescription>{label}</CardDescription>
          <span className={cn("flex size-8 items-center justify-center rounded-md", tint)}>
            <Icon className="size-4" />
          </span>
        </div>
        <CardTitle className="text-3xl font-bold tabular-nums">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

function TotalCard({
  icon: Icon,
  title,
  totals,
  tint,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  totals: ReturnType<typeof sumTotals>;
  tint: string;
}) {
  return (
    <Card className="gap-4 py-5">
      <CardHeader className="px-5">
        <CardDescription className="flex items-center gap-2">
          <span className={cn("flex size-8 items-center justify-center rounded-md", tint)}>
            <Icon className="size-4" />
          </span>
          {title}
        </CardDescription>
        <CardTitle className="text-3xl font-bold tabular-nums">
          {totals.quantity} <span className="text-base font-medium text-muted-foreground">articles</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5">
        <dl className="grid grid-cols-3 gap-3">
          <div>
            <dt className="text-xs text-muted-foreground">Poids</dt>
            <dd className="font-medium tabular-nums">{formatWeight(totals.weight)} kg</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Volume</dt>
            <dd className="font-medium tabular-nums">{formatVolume(totals.volume)} m³</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">Valeur</dt>
            <dd className="font-medium tabular-nums">{formatEuro(totals.value)}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}

function StockChartCard({
  title,
  rows,
  unit,
  onUnitChange,
  emptyTitle,
  emptyDescription,
}: {
  title: string;
  rows: StockRow[];
  unit: StockUnit;
  onUnitChange: (unit: StockUnit) => void;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const data = useMemo(() => [...rows].sort((a, b) => b[unit.value] - a[unit.value]).slice(0, 10), [rows, unit]);

  const colorByName = useMemo(() => {
    const colors = new Map<string, string>();
    rows.forEach((row, index) => colors.set(row.name, chartColor(index)));
    return colors;
  }, [rows]);

  const config = {
    [unit.value]: { label: unit.label, color: "var(--chart-1)" },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle>{title}</CardTitle>
        <Select
          value={unit.value}
          onValueChange={(value) => onUnitChange(stockUnits.find((u) => u.value === value) ?? unit)}
        >
          <SelectTrigger className="w-20">
            <SelectValue placeholder="Unité" />
          </SelectTrigger>
          <SelectContent>
            {stockUnits.map((stockUnit) => (
              <SelectItem key={stockUnit.value} value={stockUnit.value}>
                {stockUnit.unit}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Inbox />
              </EmptyMedia>
              <EmptyTitle>{emptyTitle}</EmptyTitle>
              <EmptyDescription>{emptyDescription}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <ChartContainer config={config} className="aspect-auto h-65 w-full">
            <BarChart accessibilityLayer data={data}>
              <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
              <YAxis tickLine={false} tickMargin={10} axisLine={false} unit={" " + unit.unit} />
              <ChartTooltip
                content={
                  <ChartTooltipContent indicator="line" formatter={(value) => formatByUnit(Number(value), unit)} />
                }
              />
              <Bar dataKey={unit.value} radius={4}>
                {data.map((row) => (
                  <Cell key={row.name} fill={colorByName.get(row.name) ?? chartColor(0)} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);
  const [stocks, setStocks] = useState<StockRow[]>([]);
  const [stocksInContainer, setStocksInContainer] = useState<StockRow[]>([]);
  const [donationCount, setDonationCount] = useState(0);
  const [associationCount, setAssociationCount] = useState(0);
  const [demands, setDemands] = useState<{ status: string }[]>([]);
  const [stockUnit, setStockUnit] = useState<StockUnit>(stockUnits[0]);
  const [containerUnit, setContainerUnit] = useState<StockUnit>(stockUnits[1]);

  const stockTotals = useMemo(() => sumTotals(stocks), [stocks]);
  const containerTotals = useMemo(() => sumTotals(stocksInContainer), [stocksInContainer]);
  const demandStatusData = useMemo<DemandStatusRow[]>(
    () =>
      demandStatuses.map(({ key, label }) => ({
        status: label,
        count: demands.filter((demand) => demand.status === key).length,
      })),
    [demands],
  );

  const demandChartConfig = {
    count: { label: "Demandes", color: "var(--chart-1)" },
  } satisfies ChartConfig;

  async function retrieveData() {
    setIsLoading(true);
    try {
      const responses = await Promise.all([
        fetch("/api/stocks?type=stock"),
        fetch("/api/stocks?type=container"),
        fetch("/api/donations"),
        fetch("/api/associations"),
        fetch("/api/demands"),
      ]);

      if (responses.some((response) => !response.ok)) {
        throw new Error("Échec du chargement du tableau de bord");
      }

      const [stockData, containerData, donationData, associationData, demandData] = await Promise.all(
        responses.map((response) => response.json()),
      );

      setStocks((stockData as StockRowInput[]).map(toStockRow));
      setStocksInContainer((containerData as StockRowInput[]).map(toStockRow));
      setDonationCount((donationData as unknown[]).length);
      setAssociationCount((associationData as unknown[]).length);
      setDemands(demandData as { status: string }[]);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    retrieveData();
  }, []);

  async function onExport(type: "stock" | "container") {
    setIsLoading(true);
    fetch(`/api/stocks/export?type=${type}`)
      .then((res) => {
        if (res.ok) return res.blob();
        throw res;
      })
      .then((res) => {
        const url = URL.createObjectURL(res);

        const a = document.createElement("a");
        a.href = url;
        a.download = "export.xlsx";
        a.click();
        URL.revokeObjectURL(url);
      })
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false));
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="scroll-m-20 text-2xl font-extrabold tracking-tight text-balance">Tableau de bord</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={isLoading} onClick={() => onExport("stock")}>
            <span className="hidden md:flex">Exporter le stock</span>
            <Download />
          </Button>
          <Button variant="outline" size="sm" disabled={isLoading} onClick={() => onExport("container")}>
            <span className="hidden md:flex">Exporter le stock empoté</span>
            <Download />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-[112px] rounded-xl" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-37.5 rounded-xl" />
            ))}
            <Skeleton className="h-85 rounded-xl lg:col-span-2" />
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Gift} label="Donations" value={donationCount} tint="bg-chart-1/10 text-chart-1" />
            <StatCard
              icon={Building2}
              label="Associations"
              value={associationCount}
              tint="bg-chart-2/10 text-chart-2"
            />
            <StatCard icon={ClipboardList} label="Demandes" value={demands.length} tint="bg-chart-3/10 text-chart-3" />
            <StatCard
              icon={Clock}
              label="Demandes en attente"
              value={demandStatusData[0]?.count ?? 0}
              tint="bg-status-waiting/20 text-foreground"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <TotalCard icon={Package} title="Stock total" totals={stockTotals} tint="bg-chart-3/10 text-chart-3" />
            <TotalCard
              icon={PackageOpen}
              title="Stock empoté"
              totals={containerTotals}
              tint="bg-chart-5/10 text-chart-5"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <StockChartCard
              title="Stock par type d'article"
              rows={stocks}
              unit={stockUnit}
              onUnitChange={setStockUnit}
              emptyTitle="Le stock est vide"
              emptyDescription="Aucun article n'est en stock."
            />
            <StockChartCard
              title="Contenants par type d'article"
              rows={stocksInContainer}
              unit={containerUnit}
              onUnitChange={setContainerUnit}
              emptyTitle="Les contenants sont vides"
              emptyDescription="Aucun article n'est empoté dans un contenant."
            />
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Demandes par statut</CardTitle>
              </CardHeader>
              <CardContent>
                {demands.length === 0 ? (
                  <Empty>
                    <EmptyHeader>
                      <EmptyMedia variant="icon">
                        <Inbox />
                      </EmptyMedia>
                      <EmptyTitle>Aucune demande</EmptyTitle>
                      <EmptyDescription>Aucune demande n&apos;a encore été enregistrée.</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  <ChartContainer config={demandChartConfig} className="aspect-auto h-65 w-full">
                    <BarChart accessibilityLayer data={demandStatusData}>
                      <XAxis dataKey="status" tickLine={false} tickMargin={10} axisLine={false} />
                      <YAxis tickLine={false} tickMargin={10} axisLine={false} allowDecimals={false} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" radius={4}>
                        {demandStatusData.map((_, index) => (
                          <Cell key={index} fill={chartColor(index)} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

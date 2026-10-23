"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComponentType } from "react";
import { Cell, Pie, PieChart } from "recharts";
import { ChartConfig, ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, ClipboardList, Clock, Download, Gift, Inbox, Package, PackageOpen } from "lucide-react";
import { cn, formatEuro, formatVolume, formatWeight } from "@/lib/utils";
import { STATUS_TOKENS, type StatusToken } from "@/lib/status-tokens";
import { buildStatusBreakdown, type StatusCategory, type StatusSegment } from "@/lib/status-breakdown";
import { DEMAND_STATUSES, DemandDto } from "@/app/api/demands/dto/demand.dto";
import { ContainerDto } from "@/app/api/containers/dto/container.dto";

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

type DemandStatusInput = {
  status: string;
};

type ContainerStatusInput = {
  state?: {
    key?: string;
  } | null;
};

const demandStatusCategories: StatusCategory[] = DEMAND_STATUSES.map((status) => {
  const data = DemandDto.statusData(status);
  return { key: status, label: data.text, token: data.key };
});

const containerStatusCategories: StatusCategory[] = (
  Object.keys(STATUS_TOKENS) as StatusToken[]
).map((token) => {
  const state = ContainerDto.stateData(token);
  return { key: token, label: state.text, token };
});

/** Reconstruit le `ChartConfig` depuis les catégories, sans recopier libellés ni couleurs. */
function chartConfigOf(categories: readonly StatusCategory[]): ChartConfig {
  return Object.fromEntries(
    categories.map((category) => [
      category.key,
      { label: category.label, color: STATUS_TOKENS[category.token].color },
    ]),
  );
}

const demandChartConfig = chartConfigOf(demandStatusCategories);
const containerChartConfig = chartConfigOf(containerStatusCategories);

const percentageFormatter = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 1 });

function formatPercentage(value: number): string {
  return `${percentageFormatter.format(value)} %`;
}

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

function StatusDonutTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload?: StatusSegment }[];
}) {
  const segment = payload?.[0]?.payload;
  if (!active || !segment) return null;

  return (
    <div className="border-border/50 bg-background grid min-w-36 gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl">
      <div className="flex items-center gap-1.5 font-medium">
        <span
          className="size-2 shrink-0 rounded-[2px]"
          style={{ backgroundColor: STATUS_TOKENS[segment.token].color }}
        />
        {segment.label}
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground tabular-nums">{segment.count}</span>
        <span className="font-mono font-medium tabular-nums">{formatPercentage(segment.percentage)}</span>
      </div>
    </div>
  );
}

function StatusDonutCard({
  title,
  breakdown,
  config,
  emptyDescription,
}: {
  title: string;
  breakdown: ReturnType<typeof buildStatusBreakdown>;
  config: ChartConfig;
  emptyDescription: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div className="relative h-52 w-full max-w-52 shrink-0">
            {breakdown.total === 0 ? (
              <Empty className="h-full justify-center gap-3 border-0 p-4 md:p-4">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Inbox />
                  </EmptyMedia>
                  <EmptyTitle>Aucune donnée</EmptyTitle>
                  <EmptyDescription>{emptyDescription}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <>
                <ChartContainer config={config} className="aspect-auto h-full w-full">
                  <PieChart accessibilityLayer>
                    <ChartTooltip content={<StatusDonutTooltip />} />
                    <Pie
                      data={breakdown.segments}
                      dataKey="count"
                      nameKey="label"
                      innerRadius="62%"
                      outerRadius="92%"
                      paddingAngle={2}
                      strokeWidth={2}
                    >
                      {breakdown.segments.map((segment) => (
                        <Cell key={segment.key} fill={STATUS_TOKENS[segment.token].color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold tabular-nums">{breakdown.total}</span>
                  <span className="text-xs text-muted-foreground">Total</span>
                </div>
              </>
            )}
          </div>
          <ul className="grid w-full gap-2">
            {breakdown.segments.map((segment) => (
              <li key={segment.key} className="flex items-center justify-between gap-3 text-sm">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className="size-2.5 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: STATUS_TOKENS[segment.token].color }}
                  />
                  <span className="truncate">{segment.label}</span>
                </span>
                <span className="shrink-0 text-muted-foreground tabular-nums">
                  <span className="font-medium text-foreground">{segment.count}</span> ·{" "}
                  {formatPercentage(segment.percentage)}
                </span>
              </li>
            ))}
          </ul>
        </div>
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
  const [demands, setDemands] = useState<DemandStatusInput[]>([]);
  const [containers, setContainers] = useState<ContainerStatusInput[]>([]);

  const stockTotals = useMemo(() => sumTotals(stocks), [stocks]);
  const containerTotals = useMemo(() => sumTotals(stocksInContainer), [stocksInContainer]);
  const demandBreakdown = useMemo(
    () => buildStatusBreakdown(demands, demandStatusCategories, (demand) => demand.status),
    [demands],
  );
  const containerBreakdown = useMemo(
    () => buildStatusBreakdown(containers, containerStatusCategories, (container) => container.state?.key),
    [containers],
  );
  const waitingDemandCount =
    demandBreakdown.segments.find((segment) => segment.key === "IN_PROGRESS")?.count ?? 0;

  async function retrieveData() {
    setIsLoading(true);
    try {
      const responses = await Promise.all([
        fetch("/api/stocks?type=stock"),
        fetch("/api/stocks?type=container"),
        fetch("/api/donations"),
        fetch("/api/associations"),
        fetch("/api/demands"),
        fetch("/api/containers?scope=all"),
      ]);

      if (responses.some((response) => !response.ok)) {
        throw new Error("Échec du chargement du tableau de bord");
      }

      const [stockData, containerData, donationData, associationData, demandData, containerListData] =
        await Promise.all(responses.map((response) => response.json()));

      setStocks((stockData as StockRowInput[]).map(toStockRow));
      setStocksInContainer((containerData as StockRowInput[]).map(toStockRow));
      setDonationCount((donationData as unknown[]).length);
      setAssociationCount((associationData as unknown[]).length);
      setDemands(demandData as DemandStatusInput[]);
      setContainers(containerListData as ContainerStatusInput[]);
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
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="h-80 rounded-xl" />
            ))}
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
              value={waitingDemandCount}
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
            <StatusDonutCard
              title="Demandes par statut"
              breakdown={demandBreakdown}
              config={demandChartConfig}
              emptyDescription="Aucune demande n'a encore été enregistrée."
            />
            <StatusDonutCard
              title="Contenants par statut"
              breakdown={containerBreakdown}
              config={containerChartConfig}
              emptyDescription="Aucun contenant n'a encore été enregistré."
            />
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { StockEntityShort } from "../api/stocks/entity/stock.entity";
import { PulseLoader } from "react-spinners";
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type StockUnit = {
  value: string;
  unit: string;
};

export const stockUnits: StockUnit[] = [
  { value: "quantity", unit: "#" },
  { value: "volume", unit: "m³" },
  { value: "weight", unit: "kg" },
];

export default function Page() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [stocks, setStocks] = useState<StockEntityShort[]>([]);
  const [stockUnit, setStockUnit] = useState<StockUnit>(stockUnits[0]);
  const [stocksInContainer, setStocksInContainer] = useState<StockEntityShort[]>([]);
  const [stockInContainerUnit, setStockInContainerUnit] = useState<StockUnit>(stockUnits[1]);  

  const articleInStock = stocks.reduce((acc, stock) => acc + stock.quantity, 0);
  const weightInStock = stocks.reduce((acc, stock) => acc + stock.weight, 0);
  const volumeInStock = stocks.reduce((acc, stock) => acc + stock.volume, 0);

  const articleInContainer = stocksInContainer.reduce((acc, stock) => acc + stock.quantity, 0);
  const weightInContainer = stocksInContainer.reduce((acc, stock) => acc + stock.weight, 0);
  const volumeInContainer = stocksInContainer.reduce((acc, stock) => acc + stock.volume, 0);

  async function retrieveStocks(type: "stock" | "container", setStocks: (stocks: StockEntityShort[]) => void) {
    setIsLoading(true);
    fetch(`/api/stocks?type=${type}`)
      .then((res) => {
        if (res.ok) return res.json();
        throw res;
      })
      .then((res) => res.map((obj: any) => StockEntityShort.parse(obj)))
      .then((res) => setStocks(res))
      .catch((err) => console.log(err))
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    retrieveStocks("stock", setStocks);
    retrieveStocks("container", setStocksInContainer);
  }, [])

  const chartConfig = {
    quantity: {
      label: "Articles",
      color: "#2563eb",
    },
  } satisfies ChartConfig

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-extrabold tracking-tight text-balance">
        Dashboard
      </h1>
      <div className="grid grid-cols-2 grid-rows-1 gap-4 w-full h-full">
        {isLoading ? (
          <PulseLoader size={5} color="var(--color-foreground)" />
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle> Total articles dans le stock </CardTitle>
              </CardHeader>
              <CardContent>
                {articleInStock} articles ({weightInStock} kg, {volumeInStock} m³)
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle> Total articles dans le conteneur </CardTitle>
              </CardHeader>
              <CardContent>
                {articleInContainer} articles ({weightInContainer} kg, {volumeInContainer} m³)
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle> Stock overview </CardTitle>
                <Select
                  onValueChange={(value) => setStockUnit(stockUnits.find((unit) => unit.value === value) || stockUnits[0])}
                  defaultValue={stockUnits[0].value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unité" />
                  </SelectTrigger>
                  <SelectContent>
                    {stockUnits.map((stockUnit, i) => (
                      <SelectItem key={i} value={stockUnit.value}>
                        {stockUnit.unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                {stocks.length === 0 ? (
                  <Empty>
                    <EmptyTitle>Le stock est vide </EmptyTitle>
                    <EmptyDescription>Aucun article n'est en stock.</EmptyDescription>
                  </Empty>
                ) : (
                  <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                    <BarChart accessibilityLayer data={stocks}>
                      <XAxis
                        dataKey="type"
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                      />
                      <YAxis
                        tickLine={false}
                        tickMargin={10}
                        axisLine={false}
                        unit={" " + stockUnit.unit}
                      />
                      <Bar dataKey={stockUnit.value} fill="var(--color-quantity)" radius={4} />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle> Container overview </CardTitle>
                <Select
                  onValueChange={(value) => setStockInContainerUnit(stockUnits.find((unit) => unit.value === value) || stockUnits[1])}
                  defaultValue={stockUnits[1].value}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Unité" />
                  </SelectTrigger>
                  <SelectContent>
                    {stockUnits.map((stockUnit, i) => (
                      <SelectItem key={i} value={stockUnit.value}>
                        {stockUnit.unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardHeader>
              <CardContent>
                {stocksInContainer.length === 0 ? (
                  <Empty>
                    <EmptyTitle>Le conteneur est vide </EmptyTitle>
                    <EmptyDescription>Aucun article n'est présent dans le conteneur.</EmptyDescription>
                  </Empty>
                ) : (
                  <ChartContainer config={chartConfig} className="min-h-[200px] w-full">                      
                    <BarChart accessibilityLayer data={stocksInContainer}>
                      <XAxis
                        dataKey="type"
                        tickLine={false}
                        tickMargin={5}
                        tickCount={10}
                        axisLine={false}
                      />
                      <YAxis
                        tickLine={false}
                        tickMargin={5}
                        tickCount={10}
                        axisLine={false}
                        unit={" " + stockInContainerUnit.unit}
                      />
                      <Bar dataKey={stockInContainerUnit.value} fill="var(--color-quantity)" radius={4} />
                    </BarChart>
                  </ChartContainer>
                )}
              </CardContent>
            </Card>
            
          </>
        )}
      </div>
    </div>
  );
}

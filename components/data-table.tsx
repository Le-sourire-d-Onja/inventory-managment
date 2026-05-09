"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { MoonLoader } from "react-spinners";

interface DataTableFilterOption {
  label: string;
  value: string;
}

interface DataTableFilter {
  columnId: string;
  label: string;
  options: DataTableFilterOption[];
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchColumnId?: string;
  searchPlaceholder?: string;
  filters?: DataTableFilter[];
  syncWithUrl?: boolean;
  urlParamsPrefix?: string;
  columnVisibility?: VisibilityState;
  isLoading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchColumnId,
  searchPlaceholder = "Rechercher...",
  filters = [],
  syncWithUrl = false,
  urlParamsPrefix = "",
  columnVisibility = {},
  isLoading = false,
}: DataTableProps<TData, TValue>) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filterableColumnIds = useMemo(
    () =>
      Array.from(
        new Set(
          [searchColumnId, ...filters.map((filter) => filter.columnId)].filter(
            Boolean,
          ) as string[],
        ),
      ),
    [filters, searchColumnId],
  );

  const readFiltersFromUrl = (): ColumnFiltersState =>
    filterableColumnIds.flatMap((columnId) => {
      const value = searchParams.get(`${urlParamsPrefix}${columnId}`);
      if (!value) {
        return [];
      }

      return [{ id: columnId, value }];
    });

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() =>
    syncWithUrl ? readFiltersFromUrl() : [],
  );

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  const filteredRowsCount = table.getFilteredRowModel().rows.length;
  const pageIndex = table.getState().pagination.pageIndex;
  const pageSize = table.getState().pagination.pageSize;
  const currentStart = filteredRowsCount === 0 ? 0 : pageIndex * pageSize + 1;
  const currentEnd = Math.min((pageIndex + 1) * pageSize, filteredRowsCount);
  const activeFilterCount = columnFilters.filter(
    (filter) => filter.value !== undefined && filter.value !== "",
  ).length;

  const hasFilters = useMemo(
    () => Boolean(searchColumnId) || filters.length > 0,
    [filters.length, searchColumnId],
  );

  useEffect(() => {
    if (!syncWithUrl || filterableColumnIds.length === 0) {
      return;
    }

    const nextFilters = readFiltersFromUrl();
    const next = JSON.stringify(nextFilters);
    setColumnFilters((currentFilters) => {
      const current = JSON.stringify(currentFilters);
      return current === next ? currentFilters : nextFilters;
    });
  }, [filterableColumnIds, searchParams, syncWithUrl, urlParamsPrefix]);

  useEffect(() => {
    if (!syncWithUrl || filterableColumnIds.length === 0) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    const currentById = new Map<string, string>();
    for (const filter of columnFilters) {
      if (
        filterableColumnIds.includes(filter.id) &&
        typeof filter.value === "string"
      ) {
        const normalizedValue = filter.value.trim();
        if (normalizedValue.length > 0) {
          currentById.set(filter.id, normalizedValue);
        }
      }
    }

    for (const columnId of filterableColumnIds) {
      nextParams.delete(`${urlParamsPrefix}${columnId}`);
    }

    for (const [columnId, value] of currentById.entries()) {
      nextParams.set(`${urlParamsPrefix}${columnId}`, value);
    }

    const currentUrlParams = searchParams.toString();
    const nextUrlParams = nextParams.toString();
    if (currentUrlParams !== nextUrlParams) {
      const nextUrl = nextUrlParams ? `${pathname}?${nextUrlParams}` : pathname;
      router.replace(nextUrl, { scroll: false });
    }
  }, [
    columnFilters,
    filterableColumnIds,
    pathname,
    router,
    searchParams,
    syncWithUrl,
    urlParamsPrefix,
  ]);

  return (
    <div className="space-y-4">
      {hasFilters && (
        <div className="flex flex-col gap-2 rounded-md border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center">
            {searchColumnId && (
              <Input
                placeholder={searchPlaceholder}
                value={
                  (table
                    .getColumn(searchColumnId)
                    ?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table
                    .getColumn(searchColumnId)
                    ?.setFilterValue(event.target.value)
                }
                className="w-full sm:max-w-sm"
              />
            )}
            {filters.map((filter) => {
              const column = table.getColumn(filter.columnId);
              if (!column) {
                return null;
              }

              return (
                <select
                  key={filter.columnId}
                  value={(column.getFilterValue() as string) ?? "all"}
                  onChange={(event) =>
                    column.setFilterValue(
                      event.target.value === "all"
                        ? undefined
                        : event.target.value,
                    )
                  }
                  className="border-input h-9 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="all">{filter.label}</option>
                  {filter.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              );
            })}
          </div>
          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                table.resetColumnFilters();
              }}
            >
              Réinitialiser
            </Button>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-md border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                      {header.column.getCanSort() && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {header.column.getIsSorted() === "asc"
                            ? "↑"
                            : header.column.getIsSorted() === "desc"
                              ? "↓"
                              : "-"}
                        </Button>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {!isLoading ? (
              table.getRowModel().rows?.length ? (
                table.getSortedRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    Aucun résultat.
                  </TableCell>
                </TableRow>
              )
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24">
                  <div className="flex justify-center">
                    <MoonLoader size={40} color="var(--color-foreground)" />
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground">
          Affichage de {currentStart} à {currentEnd} sur {filteredRowsCount}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground">Lignes</span>
          <select
            className="border-input h-9 rounded-md border bg-background px-2 text-sm"
            value={pageSize}
            onChange={(event) => {
              table.setPageSize(Number(event.target.value));
            }}
          >
            {[5, 10, 20, 30, 50, 100, 150].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}

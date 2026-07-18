"use client";

import { ArrowSquareOut, CaretDown, CaretUp, MagnifyingGlass } from "@phosphor-icons/react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

import { CountryCode } from "@/components/country-code";
import { Badge } from "@/components/ui/badge";
import type {
  Country,
  CountryCode as CountryCodeType,
  EvidenceSource,
  SourceRole,
} from "@/lib/domain/types";
import { formatDate } from "@/lib/utils";

const all = "all";
const controlClassName =
  "h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-foreground hover:border-accent focus:border-focus focus:outline-none";

const roleLabels: Record<SourceRole, string> = {
  observed_trend: "Observed trend",
  operational_alert: "Operational alert",
  incident_case: "Incident case",
  regulatory_trigger: "Regulatory trigger",
  control_guidance: "Control guidance",
};

export function EvidenceTable({
  data,
  countries,
}: {
  data: readonly EvidenceSource[];
  countries: readonly Country[];
}) {
  const [query, setQuery] = React.useState("");
  const [country, setCountry] = React.useState<CountryCodeType | typeof all>(all);
  const [role, setRole] = React.useState<SourceRole | typeof all>(all);
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "lastReviewedOn", desc: true },
  ]);

  const filteredData = React.useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    return data.filter((source) => {
      if (country !== all && source.country !== country) return false;
      if (role !== all && source.role !== role) return false;
      if (!needle) return true;
      return [
        source.title,
        source.nativeTitle ?? "",
        source.publisher,
        source.claim,
        source.observationPeriod.label,
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(needle);
    });
  }, [country, data, query, role]);

  const columns = React.useMemo<ColumnDef<EvidenceSource>[]>(
    () => [
      {
        accessorKey: "title",
        header: "Evidence",
        cell: ({ row }) => (
          <div className="max-w-xl">
            <a href={row.original.url} target="_blank" rel="noreferrer" className="font-semibold leading-6 text-foreground hover:text-accent-hover">
              {row.original.title} <ArrowSquareOut size={14} className="inline" />
            </a>
            {row.original.nativeTitle && row.original.nativeTitle !== row.original.title && (
              <p className="mt-1 text-xs leading-5 text-muted">{row.original.nativeTitle}</p>
            )}
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-subtle">{row.original.claim}</p>
          </div>
        ),
      },
      {
        accessorKey: "country",
        header: "Market",
        cell: ({ getValue }) => <CountryCode code={getValue<CountryCodeType>()} />,
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ getValue }) => <Badge>{roleLabels[getValue<SourceRole>()]}</Badge>,
      },
      {
        accessorKey: "observationPeriod.label",
        id: "observationPeriod",
        header: "Observation period",
        cell: ({ row }) => <span className="block max-w-48 text-xs leading-5 text-muted">{row.original.observationPeriod.label}</span>,
      },
      {
        accessorKey: "confidence",
        header: "Confidence",
        cell: ({ getValue }) => (
          <Badge variant={getValue() === "high" ? "success" : "warning"}>
            {String(getValue()).replace(/^./, (value) => value.toUpperCase())}
          </Badge>
        ),
      },
      {
        accessorKey: "lastReviewedOn",
        header: "Reviewed",
        cell: ({ getValue }) => <span className="whitespace-nowrap text-xs text-muted">{formatDate(String(getValue()))}</span>,
      },
    ],
    [],
  );

  // TanStack Table owns a stateful API that the React compiler intentionally skips.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div>
      <div className="mb-4 grid gap-3 rounded-lg border border-line bg-surface p-4 md:grid-cols-[minmax(280px,1fr)_220px_220px]">
        <label className="grid gap-2 text-xs font-semibold text-muted">
          Search evidence
          <span className="relative">
            <MagnifyingGlass size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
            <input
              type="search"
              className={`${controlClassName} pl-10`}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Title, publisher, or claim"
            />
          </span>
        </label>
        <label className="grid gap-2 text-xs font-semibold text-muted">
          Country
          <select className={controlClassName} value={country} onChange={(event) => setCountry(event.target.value as CountryCodeType | typeof all)}>
            <option value={all}>All countries</option>
            {countries.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
          </select>
        </label>
        <label className="grid gap-2 text-xs font-semibold text-muted">
          Evidence role
          <select className={controlClassName} value={role} onChange={(event) => setRole(event.target.value as SourceRole | typeof all)}>
            <option value={all}>All roles</option>
            {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3 text-xs text-subtle">
        <p>{filteredData.length} of {data.length} evidence records</p>
        <p>Official public sources only</p>
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-line bg-surface md:block scrollbar-subtle">
        <table className="w-full min-w-[980px] border-collapse text-left text-sm">
          <thead className="border-b border-line bg-surface-subtle text-xs text-subtle">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} scope="col" className="px-4 py-3 font-semibold">
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        className="inline-flex min-h-8 items-center gap-1 rounded-md text-left hover:text-foreground"
                        onClick={header.column.getToggleSortingHandler()}
                        disabled={!header.column.getCanSort()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === "asc" ? <CaretUp size={13} /> : header.column.getIsSorted() === "desc" ? <CaretDown size={13} /> : null}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-line">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="align-top hover:bg-surface-subtle">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-4">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:hidden">
        {table.getRowModel().rows.map((row) => (
          <article key={row.id} className="rounded-lg border border-line bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <CountryCode code={row.original.country} />
              <div className="flex flex-wrap justify-end gap-2"><Badge>{roleLabels[row.original.role]}</Badge><Badge variant="success">{row.original.confidence}</Badge></div>
            </div>
            <a href={row.original.url} target="_blank" rel="noreferrer" className="mt-4 block font-semibold leading-6 text-foreground hover:text-accent-hover">
              {row.original.title} <ArrowSquareOut size={15} className="inline" />
            </a>
            {row.original.nativeTitle && row.original.nativeTitle !== row.original.title && <p className="mt-1 text-sm leading-6 text-muted">{row.original.nativeTitle}</p>}
            <p className="mt-3 text-sm leading-6 text-muted">{row.original.claim}</p>
            <dl className="mt-4 grid gap-3 border-t border-line pt-4 text-xs text-subtle">
              <div><dt className="font-semibold text-muted">Observation period</dt><dd className="mt-1">{row.original.observationPeriod.label}</dd></div>
              <div><dt className="font-semibold text-muted">Publisher</dt><dd className="mt-1">{row.original.publisher}</dd></div>
            </dl>
          </article>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="rounded-lg border border-line bg-surface px-5 py-16 text-center">
          <p className="font-semibold text-foreground">No evidence matches these filters</p>
          <p className="mt-1 text-sm text-muted">Change the search, country, or evidence role.</p>
        </div>
      )}
    </div>
  );
}

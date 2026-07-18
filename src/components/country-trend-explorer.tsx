"use client";

import { Funnel, X } from "@phosphor-icons/react";
import * as React from "react";

import { TrendList } from "@/components/trend-list";
import { Button } from "@/components/ui/button";
import type {
  ConfidenceLevel,
  EvidenceSource,
  SectorId,
  Trend,
  TrendCategory,
  TrendDirection,
} from "@/lib/domain/types";

const all = "all";

const sectorLabels: Record<SectorId, string> = {
  "financial-services": "Financial services",
  "critical-infrastructure": "Critical infrastructure",
  "manufacturing-ot": "Manufacturing and OT",
};

const controlClassName =
  "h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-foreground hover:border-accent focus:border-focus focus:outline-none";

export function CountryTrendExplorer({
  trends,
  sources,
}: {
  trends: readonly Trend[];
  sources: readonly EvidenceSource[];
}) {
  const [category, setCategory] = React.useState<TrendCategory | typeof all>(all);
  const [sector, setSector] = React.useState<SectorId | typeof all>(all);
  const [direction, setDirection] = React.useState<TrendDirection | typeof all>(all);
  const [confidence, setConfidence] = React.useState<ConfidenceLevel | typeof all>(all);

  const sourceById = React.useMemo(
    () => new Map(sources.map((source) => [source.id, source])),
    [sources],
  );
  const categories = React.useMemo(
    () => [...new Set(trends.map((trend) => trend.category))].sort(),
    [trends],
  );
  const filteredTrends = trends.filter((trend) => {
    if (category !== all && trend.category !== category) return false;
    if (sector !== all && !trend.sectors.includes(sector)) return false;
    if (direction !== all && trend.direction !== direction) return false;
    if (
      confidence !== all &&
      !trend.sourceIds.some((sourceId) => sourceById.get(sourceId)?.confidence === confidence)
    ) {
      return false;
    }
    return true;
  });
  const filterCount = [category, sector, direction, confidence].filter(
    (value) => value !== all,
  ).length;

  function clearFilters() {
    setCategory(all);
    setSector(all);
    setDirection(all);
    setConfidence(all);
  }

  return (
    <section aria-labelledby="country-signals-title">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold text-accent-hover">
            <Funnel size={16} weight="duotone" /> Reviewed evidence set
          </p>
          <h2 id="country-signals-title" className="mt-1 text-xl font-semibold tracking-tight text-foreground">
            {filteredTrends.length} signal{filteredTrends.length === 1 ? "" : "s"} in view
          </h2>
        </div>
        {filterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X size={16} /> Clear {filterCount} filter{filterCount === 1 ? "" : "s"}
          </Button>
        )}
      </div>

      <div className="mb-4 grid gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-2 xl:grid-cols-4">
        <label className="grid gap-2 text-xs font-semibold text-muted">
          Category
          <select
            className={controlClassName}
            value={category}
            onChange={(event) => setCategory(event.target.value as TrendCategory | typeof all)}
          >
            <option value={all}>All categories</option>
            {categories.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-xs font-semibold text-muted">
          Sector
          <select
            className={controlClassName}
            value={sector}
            onChange={(event) => setSector(event.target.value as SectorId | typeof all)}
          >
            <option value={all}>All sectors</option>
            {Object.entries(sectorLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-xs font-semibold text-muted">
          Signal direction
          <select
            className={controlClassName}
            value={direction}
            onChange={(event) => setDirection(event.target.value as TrendDirection | typeof all)}
          >
            <option value={all}>All directions</option>
            <option value="rising">Rising</option>
            <option value="persistent">Persistent</option>
            <option value="evolving">Evolving</option>
            <option value="regulatory">Regulatory</option>
          </select>
        </label>
        <label className="grid gap-2 text-xs font-semibold text-muted">
          Evidence confidence
          <select
            className={controlClassName}
            value={confidence}
            onChange={(event) => setConfidence(event.target.value as ConfidenceLevel | typeof all)}
          >
            <option value={all}>All confidence levels</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </label>
      </div>

      <TrendList trends={filteredTrends} showCountry={false} />
    </section>
  );
}

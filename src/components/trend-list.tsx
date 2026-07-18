import { ArrowRight, Clock, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { CountryCode } from "@/components/country-code";
import { InternalOnly } from "@/components/presentation-visibility";
import { Badge } from "@/components/ui/badge";
import type { Trend } from "@/lib/domain/types";

const directionLabel = {
  rising: "Rising",
  persistent: "Persistent",
  evolving: "Evolving",
  regulatory: "Regulatory",
} as const;

export function TrendList({
  trends,
  showCountry = true,
}: {
  trends: readonly Trend[];
  showCountry?: boolean;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="hidden min-h-11 grid-cols-[minmax(0,1fr)_130px_112px_112px_36px] items-center gap-4 border-b border-line bg-surface-subtle px-4 text-xs font-semibold text-subtle lg:grid">
        <span>Signal</span>
        <span>Direction</span>
        <span>Threat priority</span>
        <InternalOnly>
          <span>Opportunity fit</span>
        </InternalOnly>
        <span className="sr-only">Open</span>
      </div>
      <div>
        {trends.map((trend, index) => (
          <Link
            key={trend.id}
            href={`/trends/${trend.slug}`}
            className="group grid min-h-28 gap-4 px-4 py-4 transition-colors hover:bg-surface-subtle lg:grid-cols-[minmax(0,1fr)_130px_112px_112px_36px] lg:items-center"
            style={index === 0 ? undefined : { borderTop: "1px solid var(--line)" }}
          >
            <div className="flex min-w-0 items-start gap-3">
              {showCountry && <CountryCode code={trend.country} />}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold leading-6 text-foreground group-hover:text-accent-hover">
                    {trend.title}
                  </h3>
                  <Badge>{trend.category}</Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted">
                  {trend.summary}
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-subtle lg:hidden">
                  <Clock size={15} />
                  {trend.observationPeriod.label}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 lg:block">
              <span className="text-xs font-medium text-subtle lg:hidden">Direction</span>
              <Badge variant={trend.direction === "rising" ? "warning" : "accent"}>
                {directionLabel[trend.direction]}
              </Badge>
            </div>
            <div className="flex items-center justify-between lg:block">
              <span className="text-xs font-medium text-subtle lg:hidden">Threat priority</span>
              <span className="numeric font-mono text-lg font-semibold text-foreground">
                {trend.threatPriority}
              </span>
            </div>
            <InternalOnly>
              <div className="flex items-center justify-between lg:block">
                <span className="text-xs font-medium text-subtle lg:hidden">Opportunity fit</span>
                <span className="numeric font-mono text-lg font-semibold text-foreground">
                  {trend.opportunityFit}
                </span>
              </div>
            </InternalOnly>
            <ArrowRight
              size={19}
              className="hidden text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-accent lg:block"
              aria-hidden="true"
            />
          </Link>
        ))}
      </div>
      {trends.length === 0 && (
        <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
          <ShieldCheck size={30} className="text-subtle" />
          <p className="mt-3 text-sm font-semibold text-foreground">No signals match</p>
          <p className="mt-1 max-w-sm text-sm text-muted">
            Clear one or more filters to return to the reviewed evidence set.
          </p>
        </div>
      )}
    </div>
  );
}

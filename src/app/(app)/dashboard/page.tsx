import {
  ArrowRight,
  CheckCircle,
  FileText,
  WarningCircle,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";

import { CountryCode } from "@/components/country-code";
import { CountryPriorityChart } from "@/components/country-priority-chart";
import { MethodologyNote } from "@/components/methodology-note";
import { MetricStrip } from "@/components/metric-strip";
import { PageContainer, PageHeader } from "@/components/page-header";
import { InternalOnly } from "@/components/presentation-visibility";
import { TrendList } from "@/components/trend-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { countries, sources, trends } from "@/lib/domain/seed";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Overview" };

type DashboardPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLocaleLowerCase();
  const publishedTrends = trends.filter((trend) => trend.status === "published");
  const filteredTrends = query
    ? publishedTrends.filter((trend) => {
        const sourceText = trend.sourceIds
          .map((sourceId) => sources.find((source) => source.id === sourceId)?.claim ?? "")
          .join(" ");
        return [trend.title, trend.summary, trend.category, sourceText]
          .join(" ")
          .toLocaleLowerCase()
          .includes(query);
      })
    : publishedTrends;

  const regionalPriority = Math.round(
    publishedTrends.reduce((sum, trend) => sum + trend.threatPriority, 0) /
      publishedTrends.length,
  );
  const countryRows = countries.map((country) => {
    const countryTrends = publishedTrends.filter((trend) => trend.country === country.code);
    return {
      ...country,
      trends: countryTrends,
      threatPriority: Math.round(
        countryTrends.reduce((sum, trend) => sum + trend.threatPriority, 0) /
          countryTrends.length,
      ),
      opportunityFit: Math.round(
        countryTrends.reduce((sum, trend) => sum + trend.opportunityFit, 0) /
          countryTrends.length,
      ),
      topTrend: [...countryTrends].sort((a, b) => b.threatPriority - a.threatPriority)[0],
    };
  });
  const rankedTrends = [...filteredTrends]
    .sort((a, b) => b.threatPriority - a.threatPriority)
    .slice(0, query ? 15 : 6);
  const staleSources = sources.filter((source) => source.status === "stale");
  const latestReview = [...sources]
    .map((source) => source.lastReviewedOn)
    .sort()
    .at(-1);

  return (
    <>
      <PageHeader
        eyebrow="Regional command view"
        title={query ? `Results for “${q.trim()}”` : "What changed across the three markets"}
        description={
          query
            ? `${filteredTrends.length} reviewed signal${filteredTrends.length === 1 ? "" : "s"} matched across approved evidence.`
            : "A reviewed, citation-backed view of cyber risk, regulatory pressure, and the security outcomes most useful in customer discovery."
        }
        actions={
          <Button asChild>
            <Link href="/briefs/new">
              Build a customer brief
              <ArrowRight size={18} />
            </Link>
          </Button>
        }
      />

      <PageContainer className="grid gap-7 lg:gap-8">
        <MetricStrip
          items={[
            {
              label: "Published signals",
              value: publishedTrends.length,
              detail: `${publishedTrends.length / countries.length} reviewed per market`,
            },
            {
              label: "Regional threat priority",
              value: regionalPriority,
              detail: "Separate 0 to 100 weighted score",
            },
            {
              label: "Approved evidence",
              value: sources.filter((source) => source.status === "approved").length,
              detail: `${sources.length} official records in library`,
            },
            {
              label: "Evidence freshness",
              value: staleSources.length === 0 ? "Current" : `${staleSources.length} stale`,
              detail: latestReview ? `Reviewed ${formatDate(latestReview)}` : "Review date pending",
            },
          ]}
        />

        {staleSources.length === 0 ? (
          <div className="flex items-start gap-3 rounded-lg border border-[#abefc6] bg-success-soft px-4 py-3 text-sm text-success">
            <CheckCircle size={20} className="mt-0.5 shrink-0" weight="fill" />
            <p>
              All published signals resolve to reviewed evidence. Source dates describe the original observation period, not today’s incident volume.
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-lg border border-[#fedf89] bg-warning-soft px-4 py-3 text-sm text-warning">
            <WarningCircle size={20} className="mt-0.5 shrink-0" weight="fill" />
            <p>{staleSources.length} sources require a fresh review before their claims are reused.</p>
          </div>
        )}

        <section aria-labelledby="market-posture-title" className="grid gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)]">
          <div className="rounded-lg border border-line bg-surface p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-accent-hover">Cross-market posture</p>
                <h2 id="market-posture-title" className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                  Priority scores by country
                </h2>
              </div>
              <Badge variant="accent">Comparable scores</Badge>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">
              Weighted review scores support prioritization. They do not compare raw national incident totals.
            </p>
            <div className="mt-4">
              <CountryPriorityChart
                data={countryRows.map((row) => ({
                  country: row.name,
                  threatPriority: row.threatPriority,
                  opportunityFit: row.opportunityFit,
                }))}
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-line bg-surface">
            <div className="border-b border-line px-5 py-4">
              <p className="text-xs font-semibold text-accent-hover">Country snapshots</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                Lead with the strongest local signal
              </h2>
            </div>
            <div className="divide-y divide-line">
              {countryRows.map((row) => (
                <Link
                  key={row.code}
                  href={`/countries/${row.code}`}
                  className="group grid gap-4 px-5 py-4 hover:bg-surface-subtle sm:grid-cols-[minmax(0,1fr)_90px_90px_24px] sm:items-center"
                >
                  <div className="flex min-w-0 gap-3">
                    <CountryCode code={row.code} />
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground group-hover:text-accent-hover">
                        {row.name}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-sm leading-5 text-muted">
                        {row.topTrend.title}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-subtle">Threat</p>
                    <p className="numeric mt-1 font-mono text-lg font-semibold text-foreground">
                      {row.threatPriority}
                    </p>
                  </div>
                  <InternalOnly>
                    <div>
                      <p className="text-[11px] font-semibold text-subtle">Opportunity</p>
                      <p className="numeric mt-1 font-mono text-lg font-semibold text-foreground">
                        {row.opportunityFit}
                      </p>
                    </div>
                  </InternalOnly>
                  <ArrowRight size={18} className="hidden text-subtle group-hover:text-accent sm:block" />
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="regional-priorities-title">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold text-accent-hover">Ranked signals</p>
              <h2 id="regional-priorities-title" className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                {query ? "Matching reviewed evidence" : "Regional priorities for customer conversations"}
              </h2>
            </div>
            {query ? (
              <Link href="/dashboard" className="text-sm font-semibold text-accent hover:text-accent-hover">
                Clear search
              </Link>
            ) : (
              <Link href="/compare" className="text-sm font-semibold text-accent hover:text-accent-hover">
                Compare all markets
              </Link>
            )}
          </div>
          <TrendList trends={rankedTrends} />
        </section>

        <MethodologyNote>
          <p className="font-semibold">Scores stay separate by design.</p>
          <p className="mt-1">
            Threat Priority combines impact, momentum, prevalence, regulatory urgency, and evidence confidence. <InternalOnly>Cisco Opportunity Fit is an internal presales measure and disappears in Presentation Mode and customer PDFs.</InternalOnly>
          </p>
        </MethodologyNote>

        <div className="flex items-center gap-3 border-t border-line pt-6 text-sm text-muted">
          <FileText size={20} className="shrink-0 text-accent" />
          <p>
            Need a customer-ready summary? The brief builder uses only approved trends, evidence IDs, and product mappings.
          </p>
        </div>
      </PageContainer>
    </>
  );
}

import { ArrowRight, Buildings, CalendarCheck, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CountryTabs } from "@/components/country-tabs";
import { CountryTrendExplorer } from "@/components/country-trend-explorer";
import { MethodologyNote } from "@/components/methodology-note";
import { MetricStrip } from "@/components/metric-strip";
import { PageContainer, PageHeader } from "@/components/page-header";
import { InternalOnly } from "@/components/presentation-visibility";
import { Button } from "@/components/ui/button";
import { countries, sources, trends } from "@/lib/domain/seed";
import type { CountryCode } from "@/lib/domain/types";
import { formatDate } from "@/lib/utils";

type CountryPageProps = { params: Promise<{ code: string }> };

function resolveCountry(code: string) {
  return countries.find((country) => country.code === code.toUpperCase());
}

export function generateStaticParams() {
  return countries.map((country) => ({ code: country.code }));
}

export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const { code } = await params;
  const country = resolveCountry(code);
  return { title: country ? `${country.name} signals` : "Country signals" };
}

export default async function CountryPage({ params }: CountryPageProps) {
  const { code } = await params;
  const country = resolveCountry(code);
  if (!country) notFound();

  const countryTrends = trends
    .filter((trend) => trend.country === country.code && trend.status === "published")
    .sort((a, b) => b.threatPriority - a.threatPriority);
  const countrySources = sources.filter((source) => source.country === country.code);
  const averageThreat = Math.round(
    countryTrends.reduce((sum, trend) => sum + trend.threatPriority, 0) / countryTrends.length,
  );
  const latestReview = [...countrySources]
    .map((source) => source.lastReviewedOn)
    .sort()
    .at(-1);
  const regulatoryTrend = countryTrends.find((trend) => trend.direction === "regulatory");

  return (
    <>
      <PageHeader
        eyebrow={`${country.localName} · ${country.regulator}`}
        title={`${country.name} cyber signals`}
        description={country.summary}
        actions={
          <Button asChild>
            <Link href={`/briefs/new?country=${country.code}`}>
              Build {country.name} brief <ArrowRight size={18} />
            </Link>
          </Button>
        }
      />
      <PageContainer className="grid gap-7 lg:gap-8">
        <CountryTabs countries={countries} active={country.code as CountryCode} />

        <MetricStrip
          items={[
            { label: "Published signals", value: countryTrends.length, detail: "All mapped to approved evidence" },
            { label: "Average threat priority", value: averageThreat, detail: "Comparable weighted review score" },
            { label: "Official evidence records", value: countrySources.length, detail: `${countrySources.filter((source) => source.status === "approved").length} reviewed` },
            { label: "Last evidence review", value: latestReview ? formatDate(latestReview) : "Pending", detail: "Observation periods remain visible" },
          ]}
        />

        <section className="grid overflow-hidden rounded-lg border border-line bg-surface lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]">
          <div className="p-5 sm:p-6">
            <p className="text-xs font-semibold text-accent-hover">Lead signal</p>
            <h2 className="mt-2 max-w-3xl text-2xl font-semibold tracking-tight text-foreground">
              {countryTrends[0].title}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
              {countryTrends[0].summary}
            </p>
            <Link
              href={`/trends/${countryTrends[0].slug}`}
              className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent hover:text-accent-hover"
            >
              Open evidence and positioning <ArrowRight size={18} />
            </Link>
          </div>
          <div className="grid border-t border-line bg-surface-subtle p-5 text-sm lg:border-l lg:border-t-0 sm:p-6">
            <div className="flex gap-3 border-b border-line pb-4">
              <Buildings size={21} className="shrink-0 text-accent" />
              <div>
                <p className="text-xs font-semibold text-subtle">Priority sectors</p>
                <p className="mt-1 leading-6 text-foreground">Financial services, critical infrastructure, manufacturing and OT</p>
              </div>
            </div>
            <div className="flex gap-3 border-b border-line py-4">
              <ShieldCheck size={21} className="shrink-0 text-accent" />
              <div>
                <p className="text-xs font-semibold text-subtle">Primary authority</p>
                <p className="mt-1 leading-6 text-foreground">{country.regulator}</p>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <CalendarCheck size={21} className="shrink-0 text-accent" />
              <div>
                <p className="text-xs font-semibold text-subtle">Regulatory signal</p>
                <p className="mt-1 leading-6 text-foreground">{regulatoryTrend?.title ?? "Review current sector obligations"}</p>
              </div>
            </div>
          </div>
        </section>

        <CountryTrendExplorer trends={countryTrends} sources={countrySources} />

        <MethodologyNote>
          <p>
            National metrics retain their original definitions. Reported incidents, detected infrastructure, unique IPs, phishing attempts, and affected entities are not treated as interchangeable totals. <InternalOnly>Opportunity Fit is visible only inside the owner workspace.</InternalOnly>
          </p>
        </MethodologyNote>
      </PageContainer>
    </>
  );
}

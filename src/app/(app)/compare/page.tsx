import {
  ArrowRight,
  Check,
  Info,
  Scales,
  ShieldChevron,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";

import { CountryCode } from "@/components/country-code";
import { CountryPriorityChart } from "@/components/country-priority-chart";
import { MethodologyNote } from "@/components/methodology-note";
import { PageContainer, PageHeader } from "@/components/page-header";
import { InternalOnly } from "@/components/presentation-visibility";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  countries,
  getRegionalStats,
  getSource,
  getTrend,
  trends,
} from "@/lib/domain/seed";
import type { CountryCode as CountryCodeType } from "@/lib/domain/types";

export const metadata: Metadata = { title: "Compare markets" };

const themes: Array<{
  name: string;
  outcome: string;
  trends: Record<CountryCodeType, string>;
}> = [
  {
    name: "Identity and social engineering",
    outcome: "Phishing-resistant, risk-aware access",
    trends: {
      SG: "trend-sg-phishing-sophistication",
      MY: "trend-my-fraud-dominance",
      ID: "trend-id-phishing-scale",
    },
  },
  {
    name: "Detection and incident response",
    outcome: "Faster scoping, investigation, and containment",
    trends: {
      SG: "trend-sg-ransomware-persistence",
      MY: "trend-my-intrusion-persistence",
      ID: "trend-id-ransomware-activity",
    },
  },
  {
    name: "Critical service resilience",
    outcome: "Governed segmentation with operational context",
    trends: {
      SG: "trend-sg-apt-telecommunications",
      MY: "trend-my-eleven-ncii-sectors",
      ID: "trend-id-vital-infrastructure",
    },
  },
];

export default function ComparePage() {
  const stats = getRegionalStats();
  const regulatoryTrends = countries.map((country) => ({
    country,
    trend: trends.find(
      (trend) => trend.country === country.code && trend.direction === "regulatory",
    ),
  }));

  return (
    <>
      <PageHeader
        eyebrow="Cross-market comparison"
        title="Compare local signals without flattening their meaning"
        description="Shared themes reveal regional customer conversations. Country differences retain local regulation, evidence definitions, and observation periods."
        actions={
          <Button asChild>
            <Link href="/briefs/new">Build a brief <ArrowRight size={18} /></Link>
          </Button>
        }
      />
      <PageContainer className="grid gap-7 lg:gap-8">
        <MethodologyNote>
          Raw national incident totals are excluded from comparison unless source definitions and normalization are compatible. The scores below compare a consistent review rubric, not national incident volumes.
        </MethodologyNote>

        <section className="grid gap-5 xl:grid-cols-[minmax(0,0.76fr)_minmax(560px,1.24fr)]">
          <div className="rounded-lg border border-line bg-surface p-5 sm:p-6">
            <div className="flex items-center gap-2 text-accent-hover">
              <Scales size={21} weight="duotone" />
              <p className="text-xs font-semibold">Comparable framework</p>
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">Average reviewed priority</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              The same weighted Threat Priority inputs are applied to every published signal.
            </p>
            <div className="mt-4">
              <CountryPriorityChart
                data={stats.countries.map((row) => ({
                  country: row.country.name,
                  threatPriority: row.averageThreatPriority,
                  opportunityFit: row.averageOpportunityFit,
                }))}
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-line bg-surface scrollbar-subtle">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <caption className="border-b border-line px-5 py-4 text-left">
                <span className="block text-xs font-semibold text-accent-hover">Market posture</span>
                <span className="mt-1 block text-xl font-semibold tracking-tight text-foreground">Strongest current signal by market</span>
              </caption>
              <thead className="bg-surface-subtle text-xs text-subtle">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Market</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Lead signal</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Threat</th>
                  <InternalOnly>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">Opportunity</th>
                  </InternalOnly>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {stats.countries.map((row) => {
                  const evidence = row.topTrend.sourceIds
                    .map((id) => getSource(id))
                    .filter(Boolean);
                  return (
                    <tr key={row.country.code} className="hover:bg-surface-subtle">
                      <th scope="row" className="px-4 py-4">
                        <Link href={`/countries/${row.country.code}`} className="flex items-center gap-3 font-semibold text-foreground hover:text-accent-hover">
                          <CountryCode code={row.country.code} /> {row.country.name}
                        </Link>
                      </th>
                      <td className="max-w-sm px-4 py-4 text-sm leading-6 text-muted">
                        <Link href={`/trends/${row.topTrend.slug}`} className="hover:text-accent-hover">{row.topTrend.title}</Link>
                      </td>
                      <td className="numeric px-4 py-4 text-right font-mono text-lg font-semibold text-foreground">{row.averageThreatPriority}</td>
                      <InternalOnly>
                        <td className="numeric px-4 py-4 text-right font-mono text-lg font-semibold text-foreground">{row.averageOpportunityFit}</td>
                      </InternalOnly>
                      <td className="px-4 py-4 text-right"><Badge variant="success">{evidence.length} reviewed</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="shared-themes-title">
          <div className="mb-4">
            <p className="text-xs font-semibold text-accent-hover">Shared themes</p>
            <h2 id="shared-themes-title" className="mt-1 text-xl font-semibold tracking-tight text-foreground">One outcome, three local starting points</h2>
          </div>
          <div className="overflow-x-auto rounded-lg border border-line bg-surface scrollbar-subtle">
            <table className="w-full min-w-[940px] border-collapse text-left text-sm">
              <thead className="bg-surface-subtle">
                <tr>
                  <th scope="col" className="w-52 px-4 py-3 text-xs font-semibold text-subtle">Regional theme</th>
                  {countries.map((country) => (
                    <th key={country.code} scope="col" className="px-4 py-3 text-xs font-semibold text-subtle">
                      <span className="flex items-center gap-2"><CountryCode code={country.code} className="size-7 rounded-md" /> {country.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {themes.map((theme) => (
                  <tr key={theme.name} className="align-top">
                    <th scope="row" className="px-4 py-4">
                      <p className="font-semibold leading-6 text-foreground">{theme.name}</p>
                      <p className="mt-2 text-xs font-medium leading-5 text-accent-hover">{theme.outcome}</p>
                    </th>
                    {countries.map((country) => {
                      const trend = getTrend(theme.trends[country.code]);
                      return (
                        <td key={country.code} className="px-4 py-4">
                          {trend && (
                            <Link href={`/trends/${trend.slug}`} className="group block">
                              <p className="font-semibold leading-6 text-foreground group-hover:text-accent-hover">{trend.title}</p>
                              <p className="mt-2 line-clamp-3 text-xs leading-5 text-muted">{trend.summary}</p>
                              <p className="mt-3 text-xs font-semibold text-accent">Open signal <ArrowRight size={14} className="inline" /></p>
                            </Link>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="regulation-title">
          <div className="mb-4 flex items-center gap-3">
            <ShieldChevron size={23} className="text-accent" weight="duotone" />
            <div>
              <p className="text-xs font-semibold text-accent-hover">Country-specific difference</p>
              <h2 id="regulation-title" className="mt-1 text-xl font-semibold tracking-tight text-foreground">Regulation changes the discovery path</h2>
            </div>
          </div>
          <div className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
            {regulatoryTrends.map(({ country, trend }) => (
              <div key={country.code} className="grid gap-4 p-5 sm:grid-cols-[180px_minmax(0,1fr)_auto] sm:items-center">
                <div className="flex items-center gap-3"><CountryCode code={country.code} /><span className="font-semibold text-foreground">{country.name}</span></div>
                <div>
                  <p className="font-semibold leading-6 text-foreground">{trend?.title ?? "Review current obligations"}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{trend?.regulatoryNote ?? `Confirm applicability with ${country.regulator}.`}</p>
                </div>
                {trend && <Link href={`/trends/${trend.slug}`} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-accent hover:text-accent-hover">View evidence <ArrowRight size={17} /></Link>}
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-4 border-t border-line pt-6 sm:grid-cols-2">
          <div className="flex gap-3 text-sm leading-6 text-muted">
            <Check size={20} className="mt-0.5 shrink-0 text-success" />
            <p><span className="font-semibold text-foreground">Evidence strength:</span> every comparison row traces to an approved official source and retains its observation period.</p>
          </div>
          <div className="flex gap-3 text-sm leading-6 text-muted">
            <Info size={20} className="mt-0.5 shrink-0 text-accent" />
            <p><span className="font-semibold text-foreground">Use with care:</span> Cisco capabilities enable controls but do not guarantee regulatory compliance.</p>
          </div>
        </div>
      </PageContainer>
    </>
  );
}

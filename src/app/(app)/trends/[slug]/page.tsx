import {
  ArrowLeft,
  ArrowRight,
  ArrowSquareOut,
  CalendarBlank,
  CheckCircle,
  ChatsCircle,
  Clock,
  Compass,
  Gavel,
  Target,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CountryCode } from "@/components/country-code";
import { PageContainer, PageHeader } from "@/components/page-header";
import { InternalOnly } from "@/components/presentation-visibility";
import { ScoreBreakdown } from "@/components/score-breakdown";
import { ScoreDisplay } from "@/components/score-display";
import { SourceCitation } from "@/components/source-citation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getCountry,
  getTrend,
  getTrendProducts,
  getTrendSources,
  trends,
} from "@/lib/domain/seed";
import type { SectorId } from "@/lib/domain/types";
import { formatDate } from "@/lib/utils";

const sectorLabels: Record<SectorId, string> = {
  "financial-services": "Financial services",
  "critical-infrastructure": "Critical infrastructure",
  "manufacturing-ot": "Manufacturing and OT",
};

type TrendPageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return trends.map((trend) => ({ slug: trend.slug }));
}

export async function generateMetadata({ params }: TrendPageProps): Promise<Metadata> {
  const { slug } = await params;
  const trend = getTrend(slug);
  return { title: trend?.title ?? "Trend detail" };
}

export default async function TrendPage({ params }: TrendPageProps) {
  const { slug } = await params;
  const trend = getTrend(slug);
  if (!trend || trend.status !== "published") notFound();

  const country = getCountry(trend.country);
  const evidence = getTrendSources(trend.id);
  const productPlay = getTrendProducts(trend.id);
  if (!country || !productPlay) notFound();

  const threatInputs = [
    { label: "Impact", value: trend.scoreInputs.threat.impact, weight: 30 },
    { label: "Momentum", value: trend.scoreInputs.threat.momentum, weight: 25 },
    { label: "Prevalence", value: trend.scoreInputs.threat.prevalence, weight: 20 },
    { label: "Regulatory urgency", value: trend.scoreInputs.threat.regulatoryUrgency, weight: 15 },
    { label: "Evidence confidence", value: trend.scoreInputs.threat.evidenceConfidence, weight: 10 },
  ] as const;
  const opportunityInputs = [
    { label: "Capability match", value: trend.scoreInputs.opportunity.capabilityMatch, weight: 30 },
    { label: "Installed-base adjacency", value: trend.scoreInputs.opportunity.installedBaseAdjacency, weight: 25 },
    { label: "Maturity gap", value: trend.scoreInputs.opportunity.maturityGap, weight: 20 },
    { label: "Engagement timing", value: trend.scoreInputs.opportunity.engagementTiming, weight: 15 },
    { label: "Available proof asset", value: trend.scoreInputs.opportunity.proofAsset, weight: 10 },
  ] as const;

  return (
    <>
      <PageHeader
        eyebrow={`${country.name} · ${trend.category}`}
        title={trend.title}
        description={trend.summary}
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={`/countries/${country.code}`}>
                <ArrowLeft size={18} /> {country.name}
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/briefs/new?country=${country.code}&trends=${trend.id}`}>
                Use in brief <ArrowRight size={18} />
              </Link>
            </Button>
          </>
        }
      />

      <PageContainer className="grid gap-7 lg:gap-8">
        <div className="flex flex-wrap items-center gap-2">
          <CountryCode code={trend.country} />
          <Badge variant="accent">{trend.direction.charAt(0).toUpperCase() + trend.direction.slice(1)}</Badge>
          {trend.sectors.map((sector) => <Badge key={sector}>{sectorLabels[sector]}</Badge>)}
          <span className="ml-auto flex items-center gap-1.5 text-xs text-subtle">
            <CalendarBlank size={16} /> Reviewed {formatDate(trend.lastReviewedOn)}
          </span>
        </div>

        <section aria-labelledby="score-title" className="grid gap-5 lg:grid-cols-[minmax(300px,0.7fr)_minmax(0,1.3fr)]">
          <div className="rounded-lg border border-line bg-surface p-5 sm:p-6">
            <p className="text-xs font-semibold text-accent-hover">Transparent prioritization</p>
            <h2 id="score-title" className="mt-1 text-xl font-semibold tracking-tight text-foreground">Why this signal matters now</h2>
            <div className="mt-6 flex flex-wrap gap-8">
              <ScoreDisplay score={trend.threatPriority} label="Threat priority" />
              <InternalOnly>
                <ScoreDisplay score={trend.opportunityFit} label="Opportunity fit" />
              </InternalOnly>
            </div>
            <p className="mt-6 text-sm leading-6 text-muted">
              Each rating is reviewed on a 0 to 5 scale, weighted, then normalized to 100. The two scores are never averaged.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Threat Priority inputs</h3>
              <ScoreBreakdown items={threatInputs} />
            </div>
            <InternalOnly>
              <div>
                <h3 className="mb-2 text-sm font-semibold text-foreground">Opportunity Fit inputs</h3>
                <ScoreBreakdown items={opportunityInputs} />
              </div>
            </InternalOnly>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.62fr)]">
          <div className="rounded-lg border border-line bg-surface p-5 sm:p-6">
            <div className="flex items-center gap-2 text-accent-hover">
              <UsersThree size={21} weight="duotone" />
              <p className="text-xs font-semibold">Customer impact</p>
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">Translate the signal into operational consequences</h2>
            <ul className="mt-5 grid gap-3">
              {trend.customerImpact.map((impact) => (
                <li key={impact} className="flex gap-3 text-sm leading-6 text-muted">
                  <CheckCircle size={19} className="mt-0.5 shrink-0 text-accent" />
                  {impact}
                </li>
              ))}
            </ul>
          </div>

          <aside className="rounded-lg border border-line bg-surface-subtle p-5 sm:p-6">
            <div className="flex items-center gap-2 text-accent-hover">
              <Clock size={20} />
              <p className="text-xs font-semibold">Observation period</p>
            </div>
            <p className="mt-3 font-semibold leading-6 text-foreground">{trend.observationPeriod.label}</p>
            <p className="mt-3 text-sm leading-6 text-muted">
              This period stays attached to the claim so an older published figure is never presented as a current incident count.
            </p>
            {trend.regulatoryNote && (
              <div className="mt-5 border-t border-line pt-5">
                <p className="flex items-center gap-2 text-xs font-semibold text-warning">
                  <Gavel size={18} /> Regulatory context
                </p>
                <p className="mt-2 text-sm leading-6 text-muted">{trend.regulatoryNote}</p>
              </div>
            )}
          </aside>
        </section>

        <section aria-labelledby="cisco-play-title" className="overflow-hidden rounded-lg border border-line bg-surface">
          <div className="grid lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div className="border-b border-line bg-[#edf7fa] p-5 lg:border-b-0 lg:border-r sm:p-6">
              <div className="flex items-center gap-2 text-accent-hover">
                <Target size={22} weight="duotone" />
                <p className="text-xs font-semibold">Cisco-aligned outcome</p>
              </div>
              <h2 id="cisco-play-title" className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                {productPlay.mapping.controlOutcome}
              </h2>
              <p className="mt-4 text-sm leading-6 text-muted">{productPlay.mapping.positioning}</p>
            </div>
            <div className="p-5 sm:p-6">
              <p className="text-xs font-semibold text-subtle">Primary capability</p>
              <a
                href={productPlay.primary.url}
                target="_blank"
                rel="noreferrer"
                className="group mt-2 flex min-h-11 items-start justify-between gap-4 rounded-lg border border-[#b7dce7] bg-surface-selected p-4"
              >
                <div>
                  <h3 className="font-semibold text-accent-hover">{productPlay.primary.name}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted">{productPlay.primary.description}</p>
                </div>
                <ArrowSquareOut size={19} className="mt-0.5 shrink-0 text-accent" />
              </a>
              {productPlay.supporting.length > 0 && (
                <div className="mt-5">
                  <p className="text-xs font-semibold text-subtle">Supporting capabilities</p>
                  <div className="mt-2 divide-y divide-line border-y border-line">
                    {productPlay.supporting.map((product) => (
                      <a key={product.id} href={product.url} target="_blank" rel="noreferrer" className="flex min-h-12 items-center justify-between gap-3 py-2 text-sm font-semibold text-foreground hover:text-accent-hover">
                        {product.name}<ArrowSquareOut size={17} className="shrink-0 text-accent" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <p className="mt-5 text-xs leading-5 text-subtle">{productPlay.mapping.disclaimer}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-2">
          <div className="rounded-lg border border-line bg-surface p-5 sm:p-6">
            <div className="flex items-center gap-2 text-accent-hover">
              <ChatsCircle size={21} weight="duotone" />
              <p className="text-xs font-semibold">Discovery questions</p>
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">Open the customer conversation</h2>
            <ol className="mt-5 grid gap-4">
              {trend.discoveryQuestions.map((question, index) => (
                <li key={question} className="flex gap-3 text-sm leading-6 text-muted">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-subtle font-mono text-xs font-bold text-accent-hover">{index + 1}</span>
                  <span className="pt-0.5">{question}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-lg border border-line bg-surface p-5 sm:p-6">
            <div className="flex items-center gap-2 text-accent-hover">
              <Compass size={21} weight="duotone" />
              <p className="text-xs font-semibold">Suggested workshop</p>
            </div>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">{trend.workshop.name}</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="accent">{trend.workshop.duration}</Badge>
              <Badge>{trend.workshop.format}</Badge>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted">{trend.workshop.objective}</p>
            <div className="mt-5 border-t border-line pt-4">
              <p className="text-xs font-semibold text-subtle">Expected outputs</p>
              <ul className="mt-2 grid gap-2 text-sm text-foreground">
                {trend.workshop.outputs.map((output) => <li key={output}>• {output}</li>)}
              </ul>
            </div>
          </div>
        </section>

        <section aria-labelledby="evidence-title">
          <div className="mb-4">
            <p className="text-xs font-semibold text-accent-hover">Traceable claims</p>
            <h2 id="evidence-title" className="mt-1 text-xl font-semibold tracking-tight text-foreground">Evidence behind this signal</h2>
          </div>
          <div className="grid gap-4 xl:grid-cols-2">
            {evidence.map((source) => <SourceCitation key={source.id} source={source} />)}
          </div>
        </section>
      </PageContainer>
    </>
  );
}

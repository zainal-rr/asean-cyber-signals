import { ArrowSquareOut, CheckCircle, WarningCircle } from "@phosphor-icons/react/dist/ssr";

import { Badge } from "@/components/ui/badge";
import type { BriefOutput } from "@/lib/briefs/schema";
import { formatDate } from "@/lib/utils";

const sectorLabels = {
  "financial-services": "Financial services",
  "critical-infrastructure": "Critical infrastructure",
  "manufacturing-ot": "Manufacturing and OT",
} as const;

export function BriefPreview({ brief }: { brief: BriefOutput }) {
  return (
    <article className="overflow-hidden rounded-lg border border-line bg-surface shadow-[0_12px_34px_rgb(15_55_72_/_0.08)]">
      <header className="border-b border-foreground px-5 py-5 sm:px-7 sm:py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-hover">ASEAN Cyber Signals</p>
            <h2 className="mt-2 max-w-2xl text-2xl font-semibold leading-tight tracking-tight text-foreground">{brief.title}</h2>
            <p className="mt-2 text-xs text-subtle">Citation-backed cybersecurity presales brief</p>
          </div>
          <Badge variant={brief.reviewedForSharing ? "success" : "warning"} className="self-start">
            {brief.reviewedForSharing ? "Reviewed for sharing" : "AI-assisted draft"}
          </Badge>
        </div>
      </header>

      {!brief.reviewedForSharing && (
        <div className="flex items-start gap-2 border-b border-[#fedf89] bg-warning-soft px-5 py-3 text-xs leading-5 text-warning sm:px-7">
          <WarningCircle size={17} className="mt-0.5 shrink-0" weight="fill" />
          Validate evidence, product capabilities, and customer relevance before sharing.
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 bg-surface-subtle px-5 py-4 text-xs sm:grid-cols-4 sm:px-7">
        <div><p className="font-semibold text-subtle">Market</p><p className="mt-1 font-semibold text-foreground">{brief.countryName}</p></div>
        <div><p className="font-semibold text-subtle">Sector</p><p className="mt-1 font-semibold text-foreground">{sectorLabels[brief.sector]}</p></div>
        <div><p className="font-semibold text-subtle">Maturity</p><p className="mt-1 font-semibold capitalize text-foreground">{brief.maturity}</p></div>
        <div><p className="font-semibold text-subtle">Generated</p><p className="mt-1 font-semibold text-foreground">{formatDate(brief.generatedAt)}</p></div>
      </div>

      <div className="px-5 py-6 sm:px-7">
        <section>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-accent-hover">Executive summary</p>
          <p className="mt-3 text-sm leading-7 text-foreground">{brief.executiveSummary}</p>
        </section>

        <section className="mt-7 border-t border-line pt-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-accent-hover">Priority outcome plays</p>
          <div className="mt-4 divide-y divide-line">
            {brief.priorities.map((priority, index) => (
              <article key={priority.trendId} className="grid gap-3 py-5 first:pt-0 sm:grid-cols-[32px_minmax(0,1fr)]">
                <span className="flex size-8 items-center justify-center rounded-full bg-foreground font-mono text-xs font-bold text-white">{index + 1}</span>
                <div>
                  <h3 className="font-semibold leading-6 text-foreground">{priority.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted">{priority.narrative}</p>
                  <div className="mt-3 rounded-lg border border-[#b7dce7] bg-surface-selected p-3">
                    <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-accent-hover">Desired security outcome</p>
                    <p className="mt-1 text-sm font-semibold leading-6 text-foreground">{priority.outcomePlay.desiredOutcome}</p>
                    <p className="mt-1 text-xs font-semibold text-accent-hover">
                      {priority.outcomePlay.primaryProduct.name}
                      {priority.outcomePlay.supportingProducts.length > 0
                        ? ` with ${priority.outcomePlay.supportingProducts.map((product) => product.name).join(" and ")}`
                        : ""}
                    </p>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs leading-5 text-muted sm:grid-cols-2">
                    <p><span className="font-semibold text-foreground">Discovery:</span> {priority.discoveryQuestions[0]}</p>
                    <p><span className="font-semibold text-foreground">Workshop:</span> {priority.recommendedWorkshop.name} ({priority.recommendedWorkshop.duration})</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-6 border-t border-line pt-6 md:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-accent-hover">Recommended next steps</p>
            <ul className="mt-3 grid gap-2">
              {brief.nextSteps.map((step) => <li key={step} className="flex gap-2 text-xs leading-5 text-muted"><CheckCircle size={16} className="mt-0.5 shrink-0 text-accent" />{step}</li>)}
            </ul>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-accent-hover">Caveats</p>
            <ul className="mt-3 grid gap-2 text-xs leading-5 text-muted">
              {brief.caveats.map((caveat) => <li key={caveat}>• {caveat}</li>)}
            </ul>
          </div>
        </section>

        <section className="mt-6 border-t border-line pt-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-accent-hover">Citations</p>
          <ol className="mt-3 grid gap-3 text-xs leading-5 text-muted">
            {brief.citations.map((citation, index) => (
              <li key={citation.evidenceId} className="grid grid-cols-[24px_minmax(0,1fr)] gap-2">
                <span className="font-mono text-subtle">[{index + 1}]</span>
                <span>
                  <a href={citation.url} target="_blank" rel="noreferrer" className="font-semibold text-accent-hover hover:underline">
                    {citation.publisher}: {citation.title} <ArrowSquareOut size={13} className="inline" />
                  </a>
                  <span className="block">Observation: {citation.observationPeriod}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <footer className="border-t border-line bg-surface-subtle px-5 py-4 text-[11px] leading-5 text-subtle sm:px-7">
        {brief.disclaimer}
      </footer>
    </article>
  );
}

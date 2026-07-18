"use client";

import { ArrowRight, FilePdf, LockKey, Sparkle, WarningCircle } from "@phosphor-icons/react";
import Link from "next/link";
import * as React from "react";

import { BriefPreview } from "@/components/brief-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { BriefInput, BriefOutput } from "@/lib/briefs/schema";
import type { CountryCode } from "@/lib/domain/types";

type BuilderTrend = {
  id: string;
  country: CountryCode;
  title: string;
  summary: string;
  threatPriority: number;
  category: string;
  observationPeriod: string;
  primaryProduct: string;
};

const options = {
  sector: [
    ["financial-services", "Financial services"],
    ["critical-infrastructure", "Critical infrastructure"],
    ["manufacturing-ot", "Manufacturing and OT"],
  ],
  maturity: [
    ["foundational", "Foundational"],
    ["developing", "Developing"],
    ["established", "Established"],
    ["advanced", "Advanced"],
  ],
  engagement: [
    ["discovery", "Discovery"],
    ["qualification", "Qualification"],
    ["technical-validation", "Technical validation"],
    ["roadmap", "Roadmap planning"],
  ],
  objective: [
    ["prioritize-cyber-investment", "Prioritize cyber investment"],
    ["reduce-ransomware-risk", "Reduce ransomware risk"],
    ["strengthen-identity", "Strengthen identity security"],
    ["meet-regulatory-obligations", "Support regulatory obligations"],
    ["secure-hybrid-cloud", "Secure hybrid cloud access"],
    ["improve-incident-readiness", "Improve incident readiness"],
  ],
} as const;

const environmentOptions = [
  ["hybrid-work", "Hybrid work"],
  ["hybrid-cloud", "Hybrid cloud"],
  ["multi-cloud", "Multi-cloud"],
  ["ot-ics", "OT and ICS"],
  ["regulated-data", "Regulated data"],
  ["third-party-access", "Third-party access"],
  ["ai-applications", "AI applications"],
] as const;

const capabilityOptions = [
  ["identity", "Identity"],
  ["secure-access", "Secure access"],
  ["network-security", "Network security"],
  ["detection-response", "Detection and response"],
  ["security-analytics", "Security analytics"],
  ["ot-security", "OT security"],
  ["vulnerability-management", "Vulnerability management"],
] as const;

const countryNames: Record<CountryCode, string> = {
  SG: "Singapore",
  MY: "Malaysia",
  ID: "Indonesia",
};

const controlClassName =
  "h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-foreground hover:border-accent focus:border-focus focus:outline-none";

function toggleValue<T extends string>(values: T[], value: T) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

export function BriefBuilder({
  trends,
  initialCountry,
  initialTrendIds,
}: {
  trends: BuilderTrend[];
  initialCountry: CountryCode;
  initialTrendIds: string[];
}) {
  const [input, setInput] = React.useState<BriefInput>({
    country: initialCountry,
    sector: "financial-services",
    maturity: "developing",
    environmentFlags: [],
    currentCiscoCapabilityFlags: [],
    engagementStage: "discovery",
    objective: "prioritize-cyber-investment",
    trendIds: initialTrendIds.filter((id) => trends.some((trend) => trend.id === id && trend.country === initialCountry)).slice(0, 5),
  });
  const [brief, setBrief] = React.useState<BriefOutput | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [reviewLoading, setReviewLoading] = React.useState(false);

  const marketTrends = trends.filter((trend) => trend.country === input.country);
  const selectedTrends = marketTrends.filter((trend) => input.trendIds.includes(trend.id));

  function updateCountry(country: CountryCode) {
    setInput((current) => ({ ...current, country, trendIds: [] }));
    setBrief(null);
  }

  function toggleTrend(id: string) {
    setInput((current) => {
      if (current.trendIds.includes(id)) {
        return { ...current, trendIds: current.trendIds.filter((trendId) => trendId !== id) };
      }
      if (current.trendIds.length >= 5) return current;
      return { ...current, trendIds: [...current.trendIds, id] };
    });
    setBrief(null);
  }

  async function generateBrief() {
    if (input.trendIds.length === 0) {
      setError("Select at least one reviewed signal before generating the brief.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/briefs/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const result = (await response.json()) as BriefOutput | { error?: string };
      if (!response.ok || !("id" in result)) {
        setError("error" in result && result.error ? result.error : "The brief could not be generated safely.");
        return;
      }
      setBrief(result);
    } catch {
      setError("The brief service is unavailable. Try again shortly.");
    } finally {
      setLoading(false);
    }
  }

  async function updateReviewStatus() {
    if (!brief) return;
    setReviewLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/briefs/${brief.id}/review`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reviewedForSharing: !brief.reviewedForSharing }),
      });
      const result = (await response.json()) as BriefOutput | { error?: string };
      if (!response.ok || !("id" in result)) {
        setError("error" in result && result.error ? result.error : "The sharing review could not be saved.");
        return;
      }
      setBrief(result);
    } catch {
      setError("The sharing review service is unavailable.");
    } finally {
      setReviewLoading(false);
    }
  }

  const pdfUrl = brief ? `/api/briefs/${brief.id}/pdf` : null;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(360px,0.72fr)_minmax(0,1.28fr)] xl:items-start">
      <div className="grid gap-5 xl:sticky xl:top-20">
        <section className="rounded-lg border border-line bg-surface p-5">
          <div className="flex items-start justify-between gap-3">
            <div><p className="text-xs font-semibold text-accent-hover">1. Scenario</p><h2 className="mt-1 text-lg font-semibold text-foreground">Set the conversation context</h2></div>
            <Badge variant="accent">No customer data</Badge>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <label className="grid gap-2 text-xs font-semibold text-muted">Country<select className={controlClassName} value={input.country} onChange={(event) => updateCountry(event.target.value as CountryCode)}>{Object.entries(countryNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="grid gap-2 text-xs font-semibold text-muted">Sector<select className={controlClassName} value={input.sector} onChange={(event) => setInput((current) => ({ ...current, sector: event.target.value as BriefInput["sector"] }))}>{options.sector.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="grid gap-2 text-xs font-semibold text-muted">Security maturity<select className={controlClassName} value={input.maturity} onChange={(event) => setInput((current) => ({ ...current, maturity: event.target.value as BriefInput["maturity"] }))}>{options.maturity.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="grid gap-2 text-xs font-semibold text-muted">Engagement stage<select className={controlClassName} value={input.engagementStage} onChange={(event) => setInput((current) => ({ ...current, engagementStage: event.target.value as BriefInput["engagementStage"] }))}>{options.engagement.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <label className="grid gap-2 text-xs font-semibold text-muted sm:col-span-2 xl:col-span-1 2xl:col-span-2">Brief objective<select className={controlClassName} value={input.objective} onChange={(event) => setInput((current) => ({ ...current, objective: event.target.value as BriefInput["objective"] }))}>{options.objective.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          </div>
        </section>

        <section className="rounded-lg border border-line bg-surface p-5">
          <p className="text-xs font-semibold text-accent-hover">2. Reviewed signals</p>
          <div className="mt-1 flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-foreground">Choose one to five priorities</h2><span className="font-mono text-xs font-semibold text-subtle">{input.trendIds.length}/5</span></div>
          <div className="mt-4 grid gap-2">
            {marketTrends.map((trend) => {
              const checked = input.trendIds.includes(trend.id);
              return (
                <label key={trend.id} className={`flex min-h-16 cursor-pointer gap-3 rounded-lg border p-3 transition-colors ${checked ? "border-accent bg-surface-selected" : "border-line hover:border-line-strong"}`}>
                  <input type="checkbox" className="mt-1 size-4 accent-[#006b8f]" checked={checked} onChange={() => toggleTrend(trend.id)} disabled={!checked && input.trendIds.length >= 5} />
                  <span className="min-w-0"><span className="block text-sm font-semibold leading-5 text-foreground">{trend.title}</span><span className="mt-1 block text-xs text-subtle">Threat {trend.threatPriority} · {trend.primaryProduct}</span></span>
                </label>
              );
            })}
          </div>
        </section>

        <details className="rounded-lg border border-line bg-surface p-5">
          <summary className="cursor-pointer text-sm font-semibold text-foreground">Environment and current Cisco capabilities</summary>
          <div className="mt-5 grid gap-5 border-t border-line pt-5">
            <fieldset><legend className="text-xs font-semibold text-muted">Environment flags</legend><div className="mt-2 grid grid-cols-2 gap-2">{environmentOptions.map(([value, label]) => <label key={value} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-line px-3 text-xs text-foreground hover:bg-surface-subtle"><input type="checkbox" className="size-4 accent-[#006b8f]" checked={input.environmentFlags.includes(value)} onChange={() => setInput((current) => ({ ...current, environmentFlags: toggleValue(current.environmentFlags, value) }))} />{label}</label>)}</div></fieldset>
            <fieldset><legend className="text-xs font-semibold text-muted">Current Cisco capability areas</legend><div className="mt-2 grid grid-cols-2 gap-2">{capabilityOptions.map(([value, label]) => <label key={value} className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-line px-3 text-xs text-foreground hover:bg-surface-subtle"><input type="checkbox" className="size-4 accent-[#006b8f]" checked={input.currentCiscoCapabilityFlags.includes(value)} onChange={() => setInput((current) => ({ ...current, currentCiscoCapabilityFlags: toggleValue(current.currentCiscoCapabilityFlags, value) }))} />{label}</label>)}</div></fieldset>
          </div>
        </details>

        {error && <p role="alert" className="flex gap-2 rounded-lg border border-[#fecdca] bg-danger-soft px-4 py-3 text-sm text-danger"><WarningCircle size={19} className="mt-0.5 shrink-0" />{error}</p>}

        <Button type="button" onClick={generateBrief} disabled={loading || input.trendIds.length === 0} className="w-full justify-between">
          <span className="flex items-center gap-2"><Sparkle size={19} />{loading ? "Generating cited brief" : brief ? "Regenerate cited brief" : "Generate cited brief"}</span><ArrowRight size={19} />
        </Button>
        <p className="flex gap-2 text-xs leading-5 text-subtle"><LockKey size={17} className="mt-0.5 shrink-0" />Only approved public evidence and opaque IDs are sent to the configured generator. No customer name or free-text architecture is accepted.</p>
      </div>

      <section aria-label="Live brief preview" className="min-w-0">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs font-semibold text-accent-hover">Live preview</p><p className="mt-1 text-sm text-muted">Customer-ready content stays citation-backed</p></div>
          {brief && (
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant={brief.reviewedForSharing ? "secondary" : "primary"} onClick={updateReviewStatus} disabled={reviewLoading}>{reviewLoading ? "Saving review" : brief.reviewedForSharing ? "Mark as draft" : "Reviewed for sharing"}</Button>
              <Button asChild size="sm" variant="secondary"><Link href={`/briefs/${brief.id}`}>Focused view</Link></Button>
              {pdfUrl && <Button asChild size="sm"><a href={pdfUrl} target="_blank" rel="noreferrer"><FilePdf size={17} /> Open PDF</a></Button>}
            </div>
          )}
        </div>

        {brief ? (
          <BriefPreview brief={brief} />
        ) : (
          <div className="min-h-[680px] rounded-lg border border-dashed border-line-strong bg-surface px-5 py-8 sm:px-8">
            <div className="border-b border-line pb-6"><p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent-hover">ASEAN Cyber Signals</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{countryNames[input.country]} cybersecurity conversation brief</h2><p className="mt-2 text-sm text-muted">Select reviewed signals and generate to build the cited narrative.</p></div>
            <div className="mt-6"><p className="text-xs font-semibold text-subtle">Selected priorities</p>{selectedTrends.length > 0 ? <ol className="mt-3 divide-y divide-line">{selectedTrends.map((trend, index) => <li key={trend.id} className="grid grid-cols-[28px_minmax(0,1fr)] gap-3 py-4"><span className="flex size-7 items-center justify-center rounded-full bg-surface-subtle font-mono text-xs font-bold text-accent-hover">{index + 1}</span><div><p className="font-semibold leading-6 text-foreground">{trend.title}</p><p className="mt-1 text-sm leading-6 text-muted">{trend.summary}</p><p className="mt-2 text-xs font-semibold text-accent-hover">Primary play: {trend.primaryProduct}</p></div></li>)}</ol> : <p className="mt-3 rounded-lg bg-surface-subtle px-4 py-10 text-center text-sm text-muted">Choose at least one signal from {countryNames[input.country]}.</p>}</div>
          </div>
        )}
      </section>
    </div>
  );
}

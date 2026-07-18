"use client";

import { ArrowRight, CheckCircle, LinkSimple, Pulse, WarningCircle } from "@phosphor-icons/react";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const controlClassName =
  "h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm text-foreground hover:border-accent focus:border-focus focus:outline-none";

type ManualResponse = {
  error?: string;
  persistence?: string;
  result?: {
    label: string;
    status: "needs_review" | "quarantined";
    publisher: string;
    submittedUrl: string;
    check: { ok: boolean; canonicalUrl?: string; contentType?: string; code?: string };
  };
};

type AdapterResponse = {
  error?: string;
  mode?: string;
  persistence?: string;
  results?: Array<{
    adapterId: string;
    status: string;
    nextItemState: string;
    health: { health: string; consecutiveFailures: number };
  }>;
};

export function ManualInboxForm() {
  const [loading, setLoading] = React.useState(false);
  const [response, setResponse] = React.useState<ManualResponse | null>(null);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setResponse(null);
    const form = new FormData(event.currentTarget);
    try {
      const request = await fetch("/api/ingestion/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          manualUrl: String(form.get("manualUrl") ?? ""),
          label: String(form.get("label") ?? ""),
        }),
      });
      const body = (await request.json()) as ManualResponse;
      setResponse(request.ok ? body : { error: body.error ?? "The source could not be checked." });
    } catch {
      setResponse({ error: "The intake service is unavailable." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <LinkSimple size={22} className="mt-0.5 shrink-0 text-accent" weight="duotone" />
        <div><p className="text-xs font-semibold text-accent-hover">Owner URL or PDF inbox</p><h2 className="mt-1 text-lg font-semibold text-foreground">Quarantine an official source for review</h2><p className="mt-2 text-sm leading-6 text-muted">Only fixed, allowlisted government and regulator hosts are accepted. The server validates redirects, public DNS, content type, size, and document signature.</p></div>
      </div>
      <form onSubmit={submit} className="mt-5 grid gap-4 md:grid-cols-[minmax(220px,0.45fr)_minmax(320px,1fr)_auto] md:items-end" aria-busy={loading}>
        <label className="grid gap-2 text-xs font-semibold text-muted">Working label<input name="label" className={controlClassName} maxLength={160} placeholder="PDP Law update" /></label>
        <label className="grid gap-2 text-xs font-semibold text-muted">Official HTTPS URL<input name="manualUrl" type="url" required className={controlClassName} maxLength={2048} placeholder="https://jdih.komdigi.go.id/..." /></label>
        <Button type="submit" disabled={loading}>{loading ? "Checking source" : "Check and quarantine"}<ArrowRight size={18} /></Button>
      </form>
      {response?.error && <p role="alert" className="mt-4 flex gap-2 rounded-lg border border-[#fecdca] bg-danger-soft px-4 py-3 text-sm text-danger"><WarningCircle size={18} className="mt-0.5 shrink-0" />{response.error}</p>}
      {response?.result && (
        <div className={`mt-4 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${response.result.status === "needs_review" ? "border-[#abefc6] bg-success-soft text-success" : "border-[#fedf89] bg-warning-soft text-warning"}`}>
          {response.result.status === "needs_review" ? <CheckCircle size={19} className="mt-0.5 shrink-0" weight="fill" /> : <WarningCircle size={19} className="mt-0.5 shrink-0" weight="fill" />}
          <div><p className="font-semibold">{response.result.status === "needs_review" ? "Added to review quarantine" : "Quarantined by a safety gate"}</p><p className="mt-1 leading-6">{response.result.publisher} · {response.result.check.ok ? response.result.check.contentType : response.result.check.code} · persistence {response.persistence ?? "unknown"}</p></div>
        </div>
      )}
    </section>
  );
}

export function AdapterRunControl() {
  const [adapterId, setAdapterId] = React.useState("all");
  const [loading, setLoading] = React.useState(false);
  const [response, setResponse] = React.useState<AdapterResponse | null>(null);

  async function run() {
    setLoading(true);
    setResponse(null);
    try {
      const request = await fetch("/api/ingestion/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(adapterId === "all" ? {} : { adapterId }),
      });
      const body = (await request.json()) as AdapterResponse;
      setResponse(request.ok ? body : { error: body.error ?? "The adapter check failed." });
    } catch {
      setResponse({ error: "The source-check service is unavailable." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-lg border border-line bg-surface p-5 sm:p-6">
      <div className="flex items-start gap-3"><Pulse size={22} className="mt-0.5 shrink-0 text-accent" weight="duotone" /><div><p className="text-xs font-semibold text-accent-hover">Shadow discovery</p><h2 className="mt-1 text-lg font-semibold text-foreground">Run an allowlisted source check</h2><p className="mt-2 text-sm leading-6 text-muted">Checks produce only review or quarantine metadata. They never create published evidence or trends.</p></div></div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="grid flex-1 gap-2 text-xs font-semibold text-muted">Adapter<select className={controlClassName} value={adapterId} onChange={(event) => setAdapterId(event.target.value)}><option value="all">All fixed adapters</option><option value="sg_csa">Singapore CSA</option><option value="my_mycert">Malaysia MyCERT</option><option value="my_csm_mirror">Malaysia CSM fallback</option><option value="my_nacsa">Malaysia NACSA</option><option value="id_idsirtii">Indonesia ID-SIRTII</option><option value="id_bssn_publications">Indonesia BSSN publications</option></select></label>
        <Button type="button" onClick={run} disabled={loading}>{loading ? "Running checks" : "Run shadow check"}<ArrowRight size={18} /></Button>
      </div>
      {response?.error && <p role="alert" className="mt-4 flex gap-2 rounded-lg border border-[#fecdca] bg-danger-soft px-4 py-3 text-sm text-danger"><WarningCircle size={18} className="mt-0.5 shrink-0" />{response.error}</p>}
      {response?.results && (
        <div className="mt-4 divide-y divide-line overflow-hidden rounded-lg border border-line">
          {response.results.map((result) => <div key={result.adapterId} className="flex flex-wrap items-center gap-3 bg-surface-subtle px-4 py-3 text-xs"><span className="font-mono font-semibold text-foreground">{result.adapterId}</span><Badge variant={result.status === "succeeded" ? "success" : result.status === "quarantined" ? "warning" : "danger"}>{result.status}</Badge><span className="ml-auto text-subtle">{result.nextItemState} · {result.health.health}</span></div>)}
        </div>
      )}
    </section>
  );
}

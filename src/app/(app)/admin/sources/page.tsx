import { ArrowSquareOut, Database, Pulse, ShieldCheck } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";

import { AdminNotice } from "@/components/admin-notice";
import { PageContainer, PageHeader } from "@/components/page-header";
import { AdapterRunControl } from "@/components/source-intake-controls";
import { Badge } from "@/components/ui/badge";
import { sources } from "@/lib/domain/seed";

export const metadata: Metadata = { title: "Source registry" };

const adapters = [
  { id: "sg_csa", market: "SG", host: "csa.gov.sg", coverage: "Sitemap, alerts, publications, press releases", cadence: "Every 4 hours", mode: "Shadow" },
  { id: "my_mycert", market: "MY", host: "mycert.org.my", coverage: "Advisories and Cyber999 statistics", cadence: "4 hours / daily", mode: "Shadow" },
  { id: "my_csm_mirror", market: "MY", host: "cybersecurity.my", coverage: "Cyber999 fallback mirror", cadence: "Every 12 hours", mode: "Fallback" },
  { id: "my_nacsa", market: "MY", host: "nacsa.gov.my", coverage: "Alerts, Act 854, and NCII pages", cadence: "6 hours / daily", mode: "Shadow" },
  { id: "id_idsirtii", market: "ID", host: "idsirtii.or.id", coverage: "Operational warnings", cadence: "Every 6 hours", mode: "Shadow" },
  { id: "id_bssn_publications", market: "ID", host: "bssn.go.id", coverage: "Cyber landscape publications", cadence: "Weekly", mode: "Shadow" },
] as const;

export default function SourceRegistryPage() {
  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Source registry"
        description="Manage the official allowlist, adapter cadence, source health, and shadow-mode readiness. Automated intake always stops in quarantine."
      />
      <PageContainer className="grid gap-6">
        <AdminNotice>
          This operational view is hidden in Presentation Mode. Komdigi, JDIH, and OJK remain owner-reviewed inbox sources because unattended collection is unreliable.
        </AdminNotice>

        <AdapterRunControl />

        <div className="grid gap-4 border-y border-line py-5 text-sm text-muted sm:grid-cols-3">
          <div className="flex items-center gap-3"><Database size={21} className="text-accent" /><div><p className="font-mono text-xl font-semibold text-foreground">{adapters.length}</p><p className="text-xs">Automated adapters</p></div></div>
          <div className="flex items-center gap-3"><ShieldCheck size={21} className="text-success" /><div><p className="font-mono text-xl font-semibold text-foreground">{new Set(adapters.map((adapter) => adapter.host)).size}</p><p className="text-xs">Allowlisted hosts</p></div></div>
          <div className="flex items-center gap-3"><Pulse size={21} className="text-accent" /><div><p className="font-mono text-xl font-semibold text-foreground">14 days</p><p className="text-xs">Required shadow run</p></div></div>
        </div>

        <section aria-labelledby="adapters-title">
          <div className="mb-4">
            <p className="text-xs font-semibold text-accent-hover">Automated discovery</p>
            <h2 id="adapters-title" className="mt-1 text-xl font-semibold tracking-tight text-foreground">Adapter readiness</h2>
          </div>
          <div className="overflow-x-auto rounded-lg border border-line bg-surface scrollbar-subtle">
            <table className="w-full min-w-[820px] border-collapse text-left text-sm">
              <thead className="border-b border-line bg-surface-subtle text-xs text-subtle">
                <tr><th className="px-4 py-3 font-semibold" scope="col">Adapter</th><th className="px-4 py-3 font-semibold" scope="col">Market</th><th className="px-4 py-3 font-semibold" scope="col">Official host</th><th className="px-4 py-3 font-semibold" scope="col">Coverage</th><th className="px-4 py-3 font-semibold" scope="col">Cadence</th><th className="px-4 py-3 font-semibold" scope="col">Mode</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {adapters.map((adapter) => (
                  <tr key={adapter.id} className="hover:bg-surface-subtle">
                    <th scope="row" className="px-4 py-4 font-mono text-xs font-semibold text-foreground">{adapter.id}</th>
                    <td className="px-4 py-4"><Badge variant="accent">{adapter.market}</Badge></td>
                    <td className="px-4 py-4 text-muted">{adapter.host}</td>
                    <td className="px-4 py-4 text-muted">{adapter.coverage}</td>
                    <td className="px-4 py-4 text-muted">{adapter.cadence}</td>
                    <td className="px-4 py-4"><Badge variant={adapter.mode === "Fallback" ? "warning" : "neutral"}>{adapter.mode}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section aria-labelledby="approved-sources-title">
          <div className="mb-4">
            <p className="text-xs font-semibold text-accent-hover">Published evidence</p>
            <h2 id="approved-sources-title" className="mt-1 text-xl font-semibold tracking-tight text-foreground">Approved source records</h2>
          </div>
          <div className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
            {sources.map((source) => (
              <div key={source.id} className="grid gap-3 px-4 py-4 sm:grid-cols-[80px_minmax(0,1fr)_140px_44px] sm:items-center">
                <Badge variant="success">Approved</Badge>
                <div className="min-w-0"><p className="font-semibold leading-6 text-foreground">{source.title}</p><p className="mt-1 text-xs text-subtle">{source.publisher} · {source.observationPeriod.label}</p></div>
                <p className="text-xs text-muted">{source.language}</p>
                <a href={source.url} target="_blank" rel="noreferrer" className="flex size-11 items-center justify-center rounded-lg border border-line text-accent hover:bg-surface-selected" aria-label={`Open ${source.title}`}><ArrowSquareOut size={18} /></a>
              </div>
            ))}
          </div>
        </section>
      </PageContainer>
    </>
  );
}

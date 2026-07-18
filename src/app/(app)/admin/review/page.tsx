import { CheckCircle, ClipboardText, Clock, Translate } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";

import { AdminNotice } from "@/components/admin-notice";
import { CountryCode } from "@/components/country-code";
import { PageContainer, PageHeader } from "@/components/page-header";
import { ManualInboxForm } from "@/components/source-intake-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { sources, trends } from "@/lib/domain/seed";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Review queue" };

export default function ReviewQueuePage() {
  const pendingSources = sources.filter((source) => source.status === "needs_review");
  const pendingTrends = trends.filter((trend) => trend.status === "in_review");
  return (
    <>
      <PageHeader eyebrow="Administration" title="Review queue" description="Inspect quarantined intake, extracted claims, translation context, product mappings, and publication prerequisites." actions={<Button asChild variant="secondary"><Link href="/admin/sources">Open source registry</Link></Button>} />
      <PageContainer className="grid gap-6">
        <AdminNotice>
          Automatic ingestion never publishes. Every claim, translation, score, and product mapping requires owner approval, with the resulting event written to the append-only audit log in Supabase.
        </AdminNotice>

        <ManualInboxForm />

        <dl className="grid overflow-hidden rounded-lg border border-line bg-surface sm:grid-cols-3">
          <div className="p-5"><dt className="text-xs font-semibold text-subtle">Claims awaiting review</dt><dd className="numeric mt-2 font-mono text-3xl font-semibold text-foreground">{pendingSources.length}</dd></div>
          <div className="border-t border-line p-5 sm:border-l sm:border-t-0"><dt className="text-xs font-semibold text-subtle">Trends awaiting publication</dt><dd className="numeric mt-2 font-mono text-3xl font-semibold text-foreground">{pendingTrends.length}</dd></div>
          <div className="border-t border-line p-5 sm:border-l sm:border-t-0"><dt className="text-xs font-semibold text-subtle">Approved seed claims</dt><dd className="numeric mt-2 font-mono text-3xl font-semibold text-foreground">{sources.filter((source) => source.status === "approved").length}</dd></div>
        </dl>

        {pendingSources.length === 0 && pendingTrends.length === 0 && (
          <div className="flex min-h-56 flex-col items-center justify-center rounded-lg border border-line bg-surface px-6 text-center">
            <CheckCircle size={34} className="text-success" weight="duotone" />
            <h2 className="mt-4 text-lg font-semibold text-foreground">Review queue is clear</h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-muted">The initial 15-signal content pack passed its evidence and mapping checks. New adapter or inbox records will remain quarantined here.</p>
          </div>
        )}

        <section aria-labelledby="reviewed-ledger-title">
          <div className="mb-4 flex items-end justify-between gap-4"><div><p className="text-xs font-semibold text-accent-hover">Reviewed ledger</p><h2 id="reviewed-ledger-title" className="mt-1 text-xl font-semibold tracking-tight text-foreground">Seed evidence approvals</h2></div><Badge variant="success">Read only</Badge></div>
          <div className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
            {sources.map((source) => (
              <div key={source.id} className="grid gap-4 px-4 py-4 sm:grid-cols-[44px_minmax(0,1fr)_160px_130px] sm:items-center">
                <CountryCode code={source.country} />
                <div className="min-w-0"><p className="font-semibold leading-6 text-foreground">{source.title}</p><p className="mt-1 line-clamp-1 text-xs text-subtle">{source.claim}</p></div>
                <div className="flex items-center gap-2 text-xs text-muted">{source.language !== "English" ? <Translate size={17} className="text-accent" /> : <ClipboardText size={17} className="text-accent" />}{source.language}</div>
                <div className="flex items-center gap-2 text-xs text-muted"><Clock size={16} />{formatDate(source.lastReviewedOn)}</div>
              </div>
            ))}
          </div>
        </section>
      </PageContainer>
    </>
  );
}

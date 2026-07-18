import { ArrowSquareOut, CheckCircle, Clock } from "@phosphor-icons/react/dist/ssr";

import { Badge } from "@/components/ui/badge";
import type { EvidenceSource } from "@/lib/domain/types";
import { formatDate } from "@/lib/utils";

export function SourceCitation({ source }: { source: EvidenceSource }) {
  return (
    <article className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={source.status === "approved" ? "success" : "warning"}>
              {source.status === "approved" ? "Reviewed" : "Needs review"}
            </Badge>
            <Badge>{source.role.replaceAll("_", " ")}</Badge>
          </div>
          <h3 className="mt-3 font-semibold leading-6 text-foreground">{source.title}</h3>
          {source.nativeTitle && source.nativeTitle !== source.title && (
            <p className="mt-1 text-sm leading-6 text-muted">{source.nativeTitle}</p>
          )}
        </div>
        <a
          href={source.url}
          target="_blank"
          rel="noreferrer"
          className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-line-strong text-accent hover:bg-surface-selected"
          aria-label={`Open official source: ${source.title}`}
        >
          <ArrowSquareOut size={19} />
        </a>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted">{source.claim}</p>
      <dl className="mt-4 grid gap-3 border-t border-line pt-4 text-xs text-subtle sm:grid-cols-3">
        <div>
          <dt className="font-semibold text-muted">Publisher</dt>
          <dd className="mt-1">{source.publisher}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 font-semibold text-muted">
            <Clock size={14} /> Observation period
          </dt>
          <dd className="mt-1">{source.observationPeriod.label}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 font-semibold text-muted">
            <CheckCircle size={14} /> Last reviewed
          </dt>
          <dd className="mt-1">{formatDate(source.lastReviewedOn)}</dd>
        </div>
      </dl>
    </article>
  );
}

import { Books, CheckCircle, ClockCounterClockwise } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";

import { EvidenceTable } from "@/components/evidence-table";
import { MetricStrip } from "@/components/metric-strip";
import { PageContainer, PageHeader } from "@/components/page-header";
import { countries, sources } from "@/lib/domain/seed";

export const metadata: Metadata = { title: "Evidence library" };

export default function EvidencePage() {
  const reviewed = sources.filter((source) => source.status === "approved");
  const publishers = new Set(sources.map((source) => source.publisher));
  const nativeLanguage = sources.filter((source) => source.language !== "English");

  return (
    <>
      <PageHeader
        eyebrow="Evidence library"
        title="Every claim stays attached to its source"
        description="Inspect official titles, original-language context, observation periods, metric definitions, confidence, and review status before using a signal."
      />
      <PageContainer className="grid gap-7 lg:gap-8">
        <MetricStrip
          items={[
            { label: "Evidence records", value: sources.length, detail: "Public official sources" },
            { label: "Reviewed", value: reviewed.length, detail: "Approved for published trends" },
            { label: "Official publishers", value: publishers.size, detail: "Across three markets" },
            { label: "Native-language records", value: nativeLanguage.length, detail: "Malay and Indonesian retained" },
          ]}
        />

        <div className="grid gap-4 border-y border-line py-5 text-sm leading-6 text-muted md:grid-cols-3">
          <div className="flex gap-3"><Books size={21} className="mt-0.5 shrink-0 text-accent" /><p><span className="font-semibold text-foreground">Original context:</span> native titles stay visible beside English working summaries.</p></div>
          <div className="flex gap-3"><ClockCounterClockwise size={21} className="mt-0.5 shrink-0 text-accent" /><p><span className="font-semibold text-foreground">Time-bounded:</span> publisher, retrieval, and observation dates are separate concepts.</p></div>
          <div className="flex gap-3"><CheckCircle size={21} className="mt-0.5 shrink-0 text-success" /><p><span className="font-semibold text-foreground">Reviewed first:</span> automated intake cannot publish a claim or trend.</p></div>
        </div>

        <EvidenceTable data={sources} countries={countries} />
      </PageContainer>
    </>
  );
}

import type { Metadata } from "next";

import { BriefBuilder } from "@/components/brief-builder";
import { PageContainer, PageHeader } from "@/components/page-header";
import { getTrendProducts, trends } from "@/lib/domain/seed";
import type { CountryCode } from "@/lib/domain/types";

export const metadata: Metadata = { title: "Brief builder" };

type BriefBuilderPageProps = {
  searchParams: Promise<{ country?: string; trends?: string }>;
};

export default async function BriefBuilderPage({ searchParams }: BriefBuilderPageProps) {
  const params = await searchParams;
  const initialCountry: CountryCode = ["SG", "MY", "ID"].includes(params.country ?? "")
    ? (params.country as CountryCode)
    : "SG";
  const initialTrendIds = (params.trends ?? "").split(",").filter(Boolean);
  const builderTrends = trends.map((trend) => ({
    id: trend.id,
    country: trend.country,
    title: trend.title,
    summary: trend.summary,
    threatPriority: trend.threatPriority,
    category: trend.category,
    observationPeriod: trend.observationPeriod.label,
    primaryProduct: getTrendProducts(trend.id)?.primary.name ?? "Mapping review required",
  }));

  return (
    <>
      <PageHeader
        eyebrow="Brief builder"
        title="Build a one-page, citation-backed customer conversation"
        description="Choose structured scenario inputs and one to five approved trends. No customer-identifying or confidential information is accepted."
      />
      <PageContainer>
        <BriefBuilder trends={builderTrends} initialCountry={initialCountry} initialTrendIds={initialTrendIds} />
      </PageContainer>
    </>
  );
}

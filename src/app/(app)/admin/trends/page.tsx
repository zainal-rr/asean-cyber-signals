import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";

import { AdminNotice } from "@/components/admin-notice";
import { CountryCode } from "@/components/country-code";
import { PageContainer, PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { getTrendProducts, trends } from "@/lib/domain/seed";

export const metadata: Metadata = { title: "Trend manager" };

export default function TrendManagerPage() {
  return (
    <>
      <PageHeader eyebrow="Administration" title="Trend manager" description="Review immutable published versions, source coverage, scoring, and the approved primary Cisco play." />
      <PageContainer className="grid gap-6">
        <AdminNotice>
          Publishing is transactional. A trend requires approved evidence and exactly one approved primary product mapping, with no more than two supporting capabilities.
        </AdminNotice>
        <div className="overflow-x-auto rounded-lg border border-line bg-surface scrollbar-subtle">
          <table className="w-full min-w-[960px] border-collapse text-left text-sm">
            <caption className="border-b border-line px-5 py-4 text-left"><span className="font-semibold text-foreground">{trends.length} published trend versions</span><span className="ml-2 text-xs text-subtle">Five per market</span></caption>
            <thead className="border-b border-line bg-surface-subtle text-xs text-subtle">
              <tr><th scope="col" className="px-4 py-3 font-semibold">Market</th><th scope="col" className="px-4 py-3 font-semibold">Trend</th><th scope="col" className="px-4 py-3 font-semibold">Status</th><th scope="col" className="px-4 py-3 text-right font-semibold">Sources</th><th scope="col" className="px-4 py-3 text-right font-semibold">Threat</th><th scope="col" className="px-4 py-3 text-right font-semibold">Opportunity</th><th scope="col" className="px-4 py-3 font-semibold">Primary play</th><th scope="col" className="px-4 py-3"><span className="sr-only">Open</span></th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {trends.map((trend) => {
                const productPlay = getTrendProducts(trend.id);
                return (
                  <tr key={trend.id} className="hover:bg-surface-subtle">
                    <td className="px-4 py-4"><CountryCode code={trend.country} /></td>
                    <th scope="row" className="max-w-md px-4 py-4 font-semibold leading-6 text-foreground">{trend.title}<p className="mt-1 text-xs font-normal text-subtle">{trend.category}</p></th>
                    <td className="px-4 py-4"><Badge variant="success">Published</Badge></td>
                    <td className="numeric px-4 py-4 text-right font-mono text-foreground">{trend.sourceIds.length}</td>
                    <td className="numeric px-4 py-4 text-right font-mono font-semibold text-foreground">{trend.threatPriority}</td>
                    <td className="numeric px-4 py-4 text-right font-mono font-semibold text-foreground">{trend.opportunityFit}</td>
                    <td className="max-w-52 px-4 py-4 text-sm text-muted">{productPlay?.primary.name ?? "Mapping required"}</td>
                    <td className="px-4 py-4"><Link href={`/trends/${trend.slug}`} className="flex size-11 items-center justify-center rounded-lg text-accent hover:bg-surface-selected" aria-label={`Open ${trend.title}`}><ArrowRight size={18} /></Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PageContainer>
    </>
  );
}

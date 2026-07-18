import { ArrowSquareOut, Package } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";

import { AdminNotice } from "@/components/admin-notice";
import { PageContainer, PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { products, trendProductMappings } from "@/lib/domain/seed";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Cisco catalog" };

export default function ProductCatalogPage() {
  return (
    <>
      <PageHeader eyebrow="Administration" title="Cisco capability catalog" description="Approved product facts and official URLs used to translate security outcomes into a primary play and limited supporting capabilities." />
      <PageContainer className="grid gap-6">
        <AdminNotice>
          Product mapping starts with the desired control outcome. Product facts should be reviewed monthly against official Cisco pages. Capabilities enable controls and do not guarantee compliance.
        </AdminNotice>
        <div className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-surface">
          {products.map((product) => {
            const primaryCount = trendProductMappings.filter((mapping) => mapping.primaryProductId === product.id).length;
            const supportCount = trendProductMappings.filter((mapping) => mapping.supportingProductIds.includes(product.id)).length;
            return (
              <article key={product.id} className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_220px_120px_44px] lg:items-center">
                <div className="flex min-w-0 gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-surface-selected text-accent"><Package size={20} weight="duotone" /></span>
                  <div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-foreground">{product.name}</h2><Badge>{product.category}</Badge></div><p className="mt-1 text-sm leading-6 text-muted">{product.description}</p><p className="mt-2 text-xs font-medium text-accent-hover">{product.outcome}</p></div>
                </div>
                <dl className="grid grid-cols-2 gap-3 text-xs"><div><dt className="text-subtle">Primary</dt><dd className="numeric mt-1 font-mono text-lg font-semibold text-foreground">{primaryCount}</dd></div><div><dt className="text-subtle">Supporting</dt><dd className="numeric mt-1 font-mono text-lg font-semibold text-foreground">{supportCount}</dd></div></dl>
                <div className="text-xs text-muted"><p className="font-semibold text-subtle">Last reviewed</p><p className="mt-1">{formatDate(product.lastReviewedOn)}</p></div>
                <a href={product.url} target="_blank" rel="noreferrer" className="flex size-11 items-center justify-center rounded-lg border border-line text-accent hover:bg-surface-selected" aria-label={`Open official page for ${product.name}`}><ArrowSquareOut size={18} /></a>
              </article>
            );
          })}
        </div>
      </PageContainer>
    </>
  );
}

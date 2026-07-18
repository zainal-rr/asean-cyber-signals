import { ArrowLeft, FilePdf } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BriefPreview } from "@/components/brief-preview";
import { PageContainer, PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { loadGeneratedBrief } from "@/lib/briefs/persistence";
import { requireOwnerSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Generated brief" };
export const dynamic = "force-dynamic";

export default async function GeneratedBriefPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireOwnerSession();
  const brief = await loadGeneratedBrief(id, session);
  if (!brief) notFound();

  return (
    <>
      <PageHeader
        eyebrow="Generated brief"
        title={brief.title}
        description="Focused on-screen view using the same validated content model as the PDF export."
        actions={
          <>
            <Button asChild variant="secondary"><Link href="/briefs/new"><ArrowLeft size={18} /> Brief builder</Link></Button>
            <Button asChild><a href={`/api/briefs/${brief.id}/pdf`} target="_blank" rel="noreferrer"><FilePdf size={18} /> Open PDF</a></Button>
          </>
        }
      />
      <PageContainer className="max-w-5xl">
        <BriefPreview brief={brief} />
      </PageContainer>
    </>
  );
}

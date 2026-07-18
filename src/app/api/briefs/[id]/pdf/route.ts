import { renderToBuffer } from "@react-pdf/renderer";
import { NextResponse } from "next/server";

import { BriefPdfDocument } from "@/components/brief-pdf";
import { getOwnerSession } from "@/lib/auth/session";
import { decodeBriefPayload } from "@/lib/briefs/payload";
import { loadGeneratedBrief } from "@/lib/briefs/persistence";
import {
  BriefIdSchema,
  type BriefOutput,
} from "@/lib/briefs/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function filenameFor(brief: BriefOutput) {
  const market = brief.countryName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `asean-cyber-signals-${market || brief.country.toLowerCase()}.pdf`;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getOwnerSession();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const { id } = await context.params;
  if (!BriefIdSchema.safeParse(id).success) {
    return NextResponse.json(
      { error: "The brief identifier is invalid." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  let brief = await loadGeneratedBrief(id, session);
  if (!brief) {
    const payload = new URL(request.url).searchParams.get("payload");
    brief = payload ? decodeBriefPayload(payload) : null;
  }

  if (!brief) {
    return NextResponse.json(
      {
        error:
          "The brief is unavailable. Generate it again or include a valid base64url payload.",
      },
      { status: 404, headers: { "Cache-Control": "no-store" } },
    );
  }

  if (id !== "preview" && brief.id !== id) {
    return NextResponse.json(
      { error: "The payload does not match the requested brief." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const document = BriefPdfDocument({ brief }) as Parameters<
      typeof renderToBuffer
    >[0];
    const pdf = await renderToBuffer(document);
    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filenameFor(brief)}"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "The brief PDF could not be rendered." },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

import { NextResponse } from "next/server";

import { getOwnerSession } from "@/lib/auth/session";
import {
  BriefPersistenceError,
  loadGeneratedBrief,
  setBriefReviewStatus,
} from "@/lib/briefs/persistence";
import { BriefIdSchema } from "@/lib/briefs/schema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    body = null;
  }
  if (
    !body ||
    typeof body !== "object" ||
    typeof (body as { reviewedForSharing?: unknown }).reviewedForSharing !== "boolean"
  ) {
    return NextResponse.json(
      { error: "A valid sharing review is required." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const brief = await loadGeneratedBrief(id, session);
    if (!brief) {
      return NextResponse.json(
        { error: "The brief is unavailable." },
        { status: 404, headers: { "Cache-Control": "no-store" } },
      );
    }
    const updated = await setBriefReviewStatus(
      brief,
      (body as { reviewedForSharing: boolean }).reviewedForSharing,
      session,
    );
    return NextResponse.json(updated, {
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    });
  } catch (error) {
    const message =
      error instanceof BriefPersistenceError
        ? error.message
        : "The sharing review could not be saved.";
    return NextResponse.json(
      { error: message },
      { status: 500, headers: { "Cache-Control": "no-store" } },
    );
  }
}

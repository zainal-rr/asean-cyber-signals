import { timingSafeEqual } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { persistAdapterRuns } from "@/lib/ingestion/persistence";
import { isAdapterId } from "@/lib/ingestion/registry";
import { runSourceAdapters } from "@/lib/ingestion/runner";

export const runtime = "nodejs";
export const preferredRegion = "sin1";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

function secretsMatch(candidate: string, expected: string) {
  const candidateBytes = Buffer.from(candidate);
  const expectedBytes = Buffer.from(expected);
  if (candidateBytes.length !== expectedBytes.length) {
    timingSafeEqual(expectedBytes, expectedBytes);
    return false;
  }
  return timingSafeEqual(candidateBytes, expectedBytes);
}

function response(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function GET(request: NextRequest) {
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected) {
    return response({ error: "Scheduled ingestion is not configured." }, 503);
  }

  const authorization = request.headers.get("authorization") ?? "";
  const candidate = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";
  if (!candidate || !secretsMatch(candidate, expected)) {
    return response({ error: "Unauthorized." }, 401);
  }

  const requestedAdapter = request.nextUrl.searchParams.get("adapter") ?? undefined;
  if (requestedAdapter !== undefined && !isAdapterId(requestedAdapter)) {
    return response({ error: "Unknown source adapter." }, 400);
  }

  const results = await runSourceAdapters(requestedAdapter);
  const persistence = await persistAdapterRuns(results);
  return response({
    mode: "shadow_discovery",
    autoPublish: false,
    persistence,
    results,
  });
}

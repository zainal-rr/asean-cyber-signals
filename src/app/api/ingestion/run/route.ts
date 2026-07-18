import { NextRequest, NextResponse } from "next/server";

import { getOwnerSession } from "@/lib/auth/session";
import {
  persistAdapterRuns,
  persistManualInboxResult,
} from "@/lib/ingestion/persistence";
import { isAdapterId } from "@/lib/ingestion/registry";
import {
  runManualInboxProbe,
  runSourceAdapters,
} from "@/lib/ingestion/runner";

export const runtime = "nodejs";
export const preferredRegion = "sin1";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

function noStoreJson(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

async function readBody(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(contentLength) && contentLength > 4096) return null;

  try {
    if (!request.body) return null;
    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;
      received += value.byteLength;
      if (received > 4096) {
        await reader.cancel().catch(() => undefined);
        return null;
      }
      chunks.push(value);
    }

    const bytes = new Uint8Array(received);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    const body = JSON.parse(new TextDecoder().decode(bytes)) as unknown;
    return body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  const session = await getOwnerSession().catch(() => null);
  if (!session) {
    return noStoreJson({ error: "Authentication required." }, 401);
  }

  const body = await readBody(request);
  if (!body) return noStoreJson({ error: "Invalid request body." }, 400);

  if (typeof body.manualUrl === "string") {
    if (body.adapterId !== undefined) {
      return noStoreJson(
        { error: "Choose an adapter run or a manual inbox submission." },
        400,
      );
    }

    const label =
      typeof body.label === "string" && body.label.trim()
        ? body.label.trim().slice(0, 160)
        : "Owner submitted source";
    const result = await runManualInboxProbe(body.manualUrl.slice(0, 2048), label);
    if (!result) {
      return noStoreJson(
        { error: "The source URL is not on the approved host allowlist." },
        400,
      );
    }

    const persistence = await persistManualInboxResult(result);
    return noStoreJson({ kind: "manual_inbox", persistence, result });
  }

  const adapterId =
    typeof body.adapterId === "string" ? body.adapterId : undefined;
  if (adapterId !== undefined && !isAdapterId(adapterId)) {
    return noStoreJson({ error: "Unknown source adapter." }, 400);
  }

  const results = await runSourceAdapters(adapterId);
  const persistence = await persistAdapterRuns(results);
  return noStoreJson({
    kind: "adapter_run",
    mode: "shadow_discovery",
    autoPublish: false,
    persistence,
    results,
  });
}

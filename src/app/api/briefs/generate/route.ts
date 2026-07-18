import { NextResponse } from "next/server";

import {
  BriefGroundingError,
  createBriefGrounding,
} from "@/lib/briefs/grounding";
import {
  BriefProviderError,
  consumeBriefRateLimit,
  createBriefGenerator,
} from "@/lib/briefs/provider";
import { BriefInputSchema } from "@/lib/briefs/schema";
import { getOwnerSession } from "@/lib/auth/session";
import { persistGeneratedBrief } from "@/lib/briefs/persistence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_REQUEST_BYTES = 16 * 1_024;

function rateLimitHeaders(result: ReturnType<typeof consumeBriefRateLimit>) {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1_000)),
  };
}

export async function POST(request: Request) {
  const session = await getOwnerSession();
  if (!session) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES) {
    return NextResponse.json(
      { error: "The brief request is too large." },
      { status: 413, headers: { "Cache-Control": "no-store" } },
    );
  }

  let body: unknown;
  try {
    const rawBody = await request.text();
    if (Buffer.byteLength(rawBody, "utf8") > MAX_REQUEST_BYTES) {
      return NextResponse.json(
        { error: "The brief request is too large." },
        { status: 413, headers: { "Cache-Control": "no-store" } },
      );
    }
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json(
      { error: "A valid JSON brief request is required." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const parsedInput = BriefInputSchema.safeParse(body);
  if (!parsedInput.success) {
    return NextResponse.json(
      {
        error: "The brief request is invalid.",
        issues: parsedInput.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const requester =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "local-owner";
  const rateLimit = consumeBriefRateLimit(requester);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Brief generation is temporarily rate limited." },
      {
        status: 429,
        headers: {
          ...rateLimitHeaders(rateLimit),
          "Retry-After": String(rateLimit.retryAfterSeconds),
          "Cache-Control": "no-store",
        },
      },
    );
  }

  try {
    const grounding = createBriefGrounding(parsedInput.data);
    const brief = await createBriefGenerator().generate(grounding);
    await persistGeneratedBrief(brief, parsedInput.data, session);

    return NextResponse.json(brief, {
      status: 200,
      headers: {
        ...rateLimitHeaders(rateLimit),
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof BriefGroundingError) {
      const status = error.code === "invalid_input" ? 400 : 409;
      return NextResponse.json(
        { error: error.message },
        {
          status,
          headers: {
            ...rateLimitHeaders(rateLimit),
            "Cache-Control": "no-store",
          },
        },
      );
    }

    if (error instanceof BriefProviderError) {
      return NextResponse.json(
        {
          error:
            "The citation-backed brief could not be generated. No unvalidated output was saved.",
        },
        {
          status: 502,
          headers: {
            ...rateLimitHeaders(rateLimit),
            "Cache-Control": "no-store",
          },
        },
      );
    }

    return NextResponse.json(
      { error: "Brief generation failed safely." },
      {
        status: 500,
        headers: {
          ...rateLimitHeaders(rateLimit),
          "Cache-Control": "no-store",
        },
      },
    );
  }
}

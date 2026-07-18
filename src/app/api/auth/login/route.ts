import { NextRequest, NextResponse } from "next/server";

import {
  applyAuthenticationResult,
  authenticateOwner,
  InvalidCredentialsError,
} from "@/lib/auth/session";
import { AuthConfigurationError } from "@/lib/supabase/config";

async function readCredentials(request: NextRequest) {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as Record<string, unknown>;
    return {
      username: typeof body.username === "string" ? body.username : "",
      password: typeof body.password === "string" ? body.password : "",
    };
  }

  const body = await request.formData();
  return {
    username: String(body.get("username") ?? ""),
    password: String(body.get("password") ?? ""),
  };
}

export async function POST(request: NextRequest) {
  try {
    const contentLength = Number(request.headers.get("content-length") ?? "0");
    if (Number.isFinite(contentLength) && contentLength > 4096) {
      return NextResponse.json(
        { error: "Unable to sign in. Please try again." },
        { status: 413, headers: { "Cache-Control": "no-store" } },
      );
    }

    const credentials = await readCredentials(request);
    const result = await authenticateOwner(
      credentials.username.slice(0, 160),
      credentials.password.slice(0, 1024),
    );
    await applyAuthenticationResult(result);

    return NextResponse.json(
      { ok: true },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      return NextResponse.json(
        { error: "Sign-in is temporarily unavailable." },
        { status: 503, headers: { "Cache-Control": "no-store" } },
      );
    }

    if (error instanceof InvalidCredentialsError) {
      return NextResponse.json(
        { error: "Invalid username or password." },
        { status: 401, headers: { "Cache-Control": "no-store" } },
      );
    }

    return NextResponse.json(
      { error: "Unable to sign in. Please try again." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }
}

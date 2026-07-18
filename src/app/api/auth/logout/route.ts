import { NextRequest, NextResponse } from "next/server";

import { signOutOwner } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  await signOutOwner();

  if (request.headers.get("accept")?.includes("application/json")) {
    return NextResponse.json(
      { ok: true },
      { status: 200, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.redirect(new URL("/login", request.url), 303);
}


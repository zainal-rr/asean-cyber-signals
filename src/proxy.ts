import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

import {
  DEMO_SESSION_COOKIE,
  verifyDemoSessionToken,
} from "@/lib/auth/session";
import {
  getDemoOwnerConfig,
  getSupabaseOwnerConfig,
} from "@/lib/supabase/config";

const AUTH_API_PATHS = new Set(["/api/auth/login", "/api/auth/logout"]);

function copyResponseCookies(from: NextResponse, to: NextResponse) {
  for (const cookie of from.cookies.getAll()) {
    to.cookies.set(cookie);
  }
  return to;
}

async function resolveSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  try {
    const supabaseConfig = getSupabaseOwnerConfig();
    if (supabaseConfig) {
      const supabase = createServerClient(
        supabaseConfig.url,
        supabaseConfig.publishableKey,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
              for (const { name, value } of cookiesToSet) {
                request.cookies.set(name, value);
              }
              response = NextResponse.next({ request });
              for (const { name, value, options } of cookiesToSet) {
                response.cookies.set(name, value, options);
              }
            },
          },
        },
      );

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const authenticated =
        Boolean(user?.email) &&
        user?.email?.toLowerCase() === supabaseConfig.ownerEmail;

      return { authenticated, response };
    }

    if (getDemoOwnerConfig()) {
      const token = request.cookies.get(DEMO_SESSION_COOKIE)?.value;
      const session = token ? await verifyDemoSessionToken(token) : null;
      return { authenticated: Boolean(session), response };
    }
  } catch {
    // Authentication configuration and provider errors fail closed.
  }

  return { authenticated: false, response };
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (AUTH_API_PATHS.has(pathname) || pathname.startsWith("/api/cron/")) {
    // Cron handlers are system-authenticated with their own secret.
    return NextResponse.next({ request });
  }

  const { authenticated, response } = await resolveSession(request);

  if (pathname === "/login") {
    if (!authenticated) {
      return response;
    }
    return copyResponseCookies(
      response,
      NextResponse.redirect(new URL("/dashboard", request.url)),
    );
  }

  if (authenticated) {
    return response;
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);
  return copyResponseCookies(response, NextResponse.redirect(loginUrl));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)",
  ],
};


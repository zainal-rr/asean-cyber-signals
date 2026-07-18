import { timingSafeEqual } from "node:crypto";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import {
  AuthConfigurationError,
  getDemoOwnerConfig,
  getSupabaseOwnerConfig,
} from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const DEMO_SESSION_COOKIE = "asean-cyber-signals-demo-session";
const DEMO_SESSION_ISSUER = "asean-cyber-signals";
const DEMO_SESSION_AUDIENCE = "asean-cyber-signals-owner";
const DEMO_SESSION_SECONDS = 60 * 60 * 12;

export type OwnerSession = {
  id: string;
  email: string | null;
  mode: "supabase" | "development-demo";
};

export type AuthenticationResult =
  | { mode: "supabase" }
  | { mode: "development-demo"; token: string };

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid username or password.");
    this.name = "InvalidCredentialsError";
  }
}

function constantTimeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left.normalize("NFKC"));
  const rightBuffer = Buffer.from(right.normalize("NFKC"));

  if (leftBuffer.length !== rightBuffer.length) {
    // Preserve roughly constant work even when lengths differ.
    timingSafeEqual(leftBuffer, leftBuffer);
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function demoSecret(secret: string) {
  return new TextEncoder().encode(secret);
}

async function createDemoToken(username: string, secret: string) {
  return new SignJWT({ role: "owner", mode: "development-demo", username })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject("development-owner")
    .setIssuer(DEMO_SESSION_ISSUER)
    .setAudience(DEMO_SESSION_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${DEMO_SESSION_SECONDS}s`)
    .sign(demoSecret(secret));
}

export async function verifyDemoSessionToken(token: string) {
  const demo = getDemoOwnerConfig();
  if (!demo) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, demoSecret(demo.sessionSecret), {
      algorithms: ["HS256"],
      issuer: DEMO_SESSION_ISSUER,
      audience: DEMO_SESSION_AUDIENCE,
    });

    if (
      payload.sub !== "development-owner" ||
      payload.role !== "owner" ||
      payload.mode !== "development-demo" ||
      payload.username !== demo.ownerUsername
    ) {
      return null;
    }

    return {
      id: "development-owner",
      email: null,
      mode: "development-demo" as const,
    };
  } catch {
    return null;
  }
}

export async function authenticateOwner(
  username: string,
  password: string,
): Promise<AuthenticationResult> {
  const normalizedUsername = username.trim();
  const supabaseConfig = getSupabaseOwnerConfig();

  if (supabaseConfig) {
    const usernameMatches = constantTimeEqual(
      normalizedUsername,
      supabaseConfig.ownerUsername,
    );

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: supabaseConfig.ownerEmail,
      password,
    });

    if (
      error ||
      !usernameMatches ||
      !data.user?.email ||
      !constantTimeEqual(data.user.email.toLowerCase(), supabaseConfig.ownerEmail)
    ) {
      await supabase.auth.signOut().catch(() => undefined);
      throw new InvalidCredentialsError();
    }

    return { mode: "supabase" };
  }

  const demo = getDemoOwnerConfig();
  if (demo) {
    const usernameMatches = constantTimeEqual(
      normalizedUsername,
      demo.ownerUsername,
    );
    const passwordMatches = constantTimeEqual(password, demo.ownerPassword);

    if (!usernameMatches || !passwordMatches) {
      throw new InvalidCredentialsError();
    }

    return {
      mode: "development-demo",
      token: await createDemoToken(demo.ownerUsername, demo.sessionSecret),
    };
  }

  throw new AuthConfigurationError();
}

export async function applyAuthenticationResult(result: AuthenticationResult) {
  if (result.mode !== "development-demo") {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(DEMO_SESSION_COOKIE, result.token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: DEMO_SESSION_SECONDS,
  });
}

export async function getOwnerSession(): Promise<OwnerSession | null> {
  const supabaseConfig = getSupabaseOwnerConfig();

  if (supabaseConfig) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (
      !user?.email ||
      !constantTimeEqual(user.email.toLowerCase(), supabaseConfig.ownerEmail)
    ) {
      return null;
    }

    return { id: user.id, email: user.email, mode: "supabase" };
  }

  const demo = getDemoOwnerConfig();
  if (!demo) {
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(DEMO_SESSION_COOKIE)?.value;
  return token ? verifyDemoSessionToken(token) : null;
}

export async function requireOwnerSession() {
  const session = await getOwnerSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function signOutOwner() {
  try {
    if (getSupabaseOwnerConfig()) {
      const supabase = await createSupabaseServerClient();
      await supabase.auth.signOut();
    }
  } catch (error) {
    if (!(error instanceof AuthConfigurationError)) {
      throw error;
    }
  } finally {
    const cookieStore = await cookies();
    cookieStore.set(DEMO_SESSION_COOKIE, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(0),
    });
  }
}

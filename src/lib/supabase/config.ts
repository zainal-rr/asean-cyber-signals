export class AuthConfigurationError extends Error {
  constructor() {
    super("Authentication is not configured correctly.");
    this.name = "AuthConfigurationError";
  }
}

export type SupabasePublicConfig = {
  url: string;
  publishableKey: string;
};

export type SupabaseOwnerConfig = SupabasePublicConfig & {
  ownerUsername: string;
  ownerEmail: string;
};

export type SupabaseAdminConfig = SupabasePublicConfig & {
  serviceRoleKey: string;
};

export type DemoOwnerConfig = {
  ownerUsername: string;
  ownerPassword: string;
  sessionSecret: string;
};

function clean(value: string | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

export function getSupabasePublicConfig(): SupabasePublicConfig | null {
  const url = clean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const publishableKey = clean(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  if (!url && !publishableKey) {
    return null;
  }

  if (!url || !publishableKey) {
    throw new AuthConfigurationError();
  }

  return { url, publishableKey };
}

export function getSupabaseOwnerConfig(): SupabaseOwnerConfig | null {
  const supabase = getSupabasePublicConfig();
  const ownerUsername = clean(process.env.OWNER_USERNAME);
  const ownerEmail = clean(process.env.OWNER_EMAIL)?.toLowerCase();

  if (!supabase && !ownerUsername && !ownerEmail) {
    return null;
  }

  if (!supabase || !ownerUsername || !ownerEmail) {
    throw new AuthConfigurationError();
  }

  return { ...supabase, ownerUsername, ownerEmail };
}

export function getSupabaseAdminConfig(): SupabaseAdminConfig {
  const supabase = getSupabasePublicConfig();
  const serviceRoleKey = clean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!supabase || !serviceRoleKey) {
    throw new AuthConfigurationError();
  }

  return { ...supabase, serviceRoleKey };
}

export function getDemoOwnerConfig(): DemoOwnerConfig | null {
  if (process.env.NODE_ENV === "production") {
    return null;
  }

  const ownerUsername = clean(process.env.DEMO_OWNER_USERNAME);
  const ownerPassword = process.env.DEMO_OWNER_PASSWORD;
  const sessionSecret = process.env.SESSION_SECRET;

  if (!ownerUsername && !ownerPassword && !sessionSecret) {
    return null;
  }

  if (
    !ownerUsername ||
    !ownerPassword ||
    !sessionSecret ||
    sessionSecret.length < 32
  ) {
    throw new AuthConfigurationError();
  }

  return { ownerUsername, ownerPassword, sessionSecret };
}

export function assertProductionAuthConfigured() {
  if (process.env.NODE_ENV !== "production") {
    return;
  }

  if (!getSupabaseOwnerConfig()) {
    throw new AuthConfigurationError();
  }
}

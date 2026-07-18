"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  AuthConfigurationError,
  getSupabasePublicConfig,
} from "@/lib/supabase/config";

let browserClient: SupabaseClient | undefined;

export function createSupabaseBrowserClient() {
  const config = getSupabasePublicConfig();

  if (!config) {
    throw new AuthConfigurationError();
  }

  browserClient ??= createBrowserClient(config.url, config.publishableKey);
  return browserClient;
}


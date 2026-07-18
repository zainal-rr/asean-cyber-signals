import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase/server";

import type { AdapterRunResult, ManualInboxResult } from "./types";

export type PersistenceStatus = "recorded" | "not_configured" | "failed";

function isPersistenceConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export async function persistAdapterRuns(
  results: readonly AdapterRunResult[],
): Promise<PersistenceStatus> {
  if (!isPersistenceConfigured()) return "not_configured";

  try {
    const supabase = createSupabaseAdminClient();

    for (const result of results) {
      const { data: source, error: sourceError } = await supabase
        .from("source_registry")
        .select("id, consecutive_failures")
        .eq("source_key", result.adapterId)
        .single();
      if (sourceError || !source) throw new Error("source_registry_lookup_failed");

      const nextFailures =
        result.status === "succeeded" ? 0 : source.consecutive_failures + 1;
      const nextHealth = nextFailures >= 3 ? "degraded" : "shadow";
      const successfulAt =
        result.status === "succeeded" ? result.finishedAt : undefined;

      const { error: updateError } = await supabase
        .from("source_registry")
        .update({
          last_checked_at: result.finishedAt,
          ...(successfulAt ? { last_successful_at: successfulAt } : {}),
          consecutive_failures: nextFailures,
          health: nextHealth,
        })
        .eq("id", source.id);
      if (updateError) throw new Error("source_registry_update_failed");

      const failureCodes = result.checks
        .filter((check) => !check.ok)
        .map((check) => check.code)
        .join(",");
      const { error: jobError } = await supabase.from("ingestion_jobs").insert({
        source_registry_id: source.id,
        status:
          result.status === "succeeded"
            ? "succeeded"
            : result.status === "quarantined"
              ? "quarantined"
              : "failed",
        started_at: result.startedAt,
        finished_at: result.finishedAt,
        items_seen: 0,
        items_created: 0,
        items_quarantined:
          result.status === "quarantined"
            ? result.checks.filter((check) => !check.ok).length
            : 0,
        error_code: failureCodes || null,
        error_detail: failureCodes ? "Source probe did not pass review gates." : null,
      });
      if (jobError) throw new Error("ingestion_job_insert_failed");
    }

    return "recorded";
  } catch {
    return "failed";
  }
}

export async function persistManualInboxResult(
  result: ManualInboxResult,
): Promise<PersistenceStatus> {
  if (!isPersistenceConfigured()) return "not_configured";

  try {
    const supabase = createSupabaseAdminClient();
    const { data: source, error: sourceError } = await supabase
      .from("source_registry")
      .select("id")
      .eq("source_key", result.sourceKey)
      .single();
    if (sourceError || !source) throw new Error("source_registry_lookup_failed");

    const metadata = {
      intake: "manual_url",
      intake_id: result.inboxId,
      review_gate: result.status,
      probe: result.check,
      auto_publish: false,
    };
    const { error: itemError } = await supabase.from("source_items").upsert(
      {
        source_registry_id: source.id,
        canonical_url: result.check.ok
          ? result.check.canonicalUrl
          : result.submittedUrl,
        title: result.label,
        original_title: result.label,
        original_language:
          result.country === "ID" ? "id" : result.country === "MY" ? "ms" : "en",
        retrieved_at: result.check.checkedAt,
        content_type: result.check.ok ? result.check.contentType : null,
        content_hash: result.check.ok ? result.check.contentHash : null,
        status: result.status === "needs_review" ? "needs_review" : "discovered",
        metadata,
      },
      { onConflict: "source_registry_id,canonical_url" },
    );
    if (itemError) throw new Error("source_item_upsert_failed");
    return "recorded";
  } catch {
    return "failed";
  }
}

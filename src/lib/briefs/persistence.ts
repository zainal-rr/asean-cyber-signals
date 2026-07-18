import "server-only";

import { saveGeneratedBrief, getGeneratedBrief } from "@/lib/briefs/grounding";
import type { BriefInput, BriefOutput } from "@/lib/briefs/schema";
import { BriefOutputSchema } from "@/lib/briefs/schema";
import type { OwnerSession } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const maturityScore: Record<BriefInput["maturity"], number> = {
  foundational: 1,
  developing: 2,
  established: 3,
  advanced: 4,
};

export class BriefPersistenceError extends Error {
  constructor(message = "The generated brief could not be saved securely.") {
    super(message);
    this.name = "BriefPersistenceError";
  }
}

export async function persistGeneratedBrief(
  brief: BriefOutput,
  input: BriefInput,
  session: OwnerSession,
) {
  saveGeneratedBrief(brief);
  if (session.mode !== "supabase") return;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("briefs").upsert(
    {
      id: brief.id,
      owner_id: session.id,
      title: brief.title,
      country_code: input.country,
      sector_id: input.sector,
      maturity: maturityScore[input.maturity],
      environment_flags: input.environmentFlags,
      current_cisco_capability_flags: input.currentCiscoCapabilityFlags,
      engagement_stage: input.engagementStage,
      objective: input.objective,
      selected_trend_ids: input.trendIds,
      status: brief.reviewedForSharing ? "reviewed" : "generated",
      output: brief,
      evidence_snapshot: {
        selectedTrendIds: brief.selectedTrendIds,
        citations: brief.citations,
      },
      reviewed_for_sharing: brief.reviewedForSharing,
      reviewed_at: brief.reviewedForSharing ? new Date().toISOString() : null,
    },
    { onConflict: "id" },
  );

  if (error) throw new BriefPersistenceError();
}

export async function loadGeneratedBrief(id: string, session: OwnerSession) {
  const memoryBrief = getGeneratedBrief(id);
  if (memoryBrief) return memoryBrief;
  if (session.mode !== "supabase") return null;

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("briefs")
    .select("output")
    .eq("id", id)
    .eq("owner_id", session.id)
    .maybeSingle();

  if (error) throw new BriefPersistenceError("The saved brief could not be loaded securely.");
  if (!data?.output) return null;
  const brief = BriefOutputSchema.parse(data.output);
  saveGeneratedBrief(brief);
  return brief;
}

export async function setBriefReviewStatus(
  brief: BriefOutput,
  reviewedForSharing: boolean,
  session: OwnerSession,
) {
  const updated = BriefOutputSchema.parse({ ...brief, reviewedForSharing });
  saveGeneratedBrief(updated);
  if (session.mode !== "supabase") return updated;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("briefs")
    .update({
      status: reviewedForSharing ? "reviewed" : "generated",
      output: updated,
      reviewed_for_sharing: reviewedForSharing,
      reviewed_at: reviewedForSharing ? new Date().toISOString() : null,
    })
    .eq("id", brief.id)
    .eq("owner_id", session.id);

  if (error) throw new BriefPersistenceError("The sharing review could not be saved.");
  return updated;
}

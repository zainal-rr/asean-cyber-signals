import { describe, expect, it } from "vitest";

import { generateDeterministicBrief } from "@/lib/briefs/fallback";
import {
  BriefGroundingError,
  createBriefGrounding,
  validateBriefGrounding,
} from "@/lib/briefs/grounding";
import { consumeBriefRateLimit } from "@/lib/briefs/provider";
import type { BriefInput } from "@/lib/briefs/schema";

const baseInput: BriefInput = {
  country: "SG",
  sector: "financial-services",
  maturity: "developing",
  environmentFlags: ["hybrid-cloud", "regulated-data"],
  currentCiscoCapabilityFlags: ["network-security"],
  engagementStage: "discovery",
  objective: "improve-incident-readiness",
  trendIds: [
    "trend-sg-ransomware-persistence",
    "trend-sg-phishing-sophistication",
  ],
};

describe("brief grounding", () => {
  it("builds a deterministic brief from approved evidence and mappings", () => {
    const context = createBriefGrounding(baseInput);
    const brief = generateDeterministicBrief(context, "2026-07-18T10:00:00.000Z");

    expect(brief.selectedTrendIds).toEqual(baseInput.trendIds);
    expect(brief.priorities).toHaveLength(2);
    expect(brief.citations.map((citation) => citation.evidenceId)).toEqual([
      "src-sg-ransomware-2025",
      "src-sg-phishing-2025",
    ]);
    expect(brief.priorities[0].outcomePlay.primaryProduct.name).toBe("Cisco XDR");
    expect(JSON.stringify(brief).toLocaleLowerCase()).not.toContain("opportunity fit");
    expect(brief.reviewedForSharing).toBe(false);
  });

  it("rejects an unknown trend before generation", () => {
    expect(() =>
      createBriefGrounding({ ...baseInput, trendIds: ["trend-not-approved"] }),
    ).toThrow(BriefGroundingError);
  });

  it("rejects a trend from a different country", () => {
    expect(() =>
      createBriefGrounding({ ...baseInput, trendIds: ["trend-my-fraud-dominance"] }),
    ).toThrow(/does not belong to the selected country/);
  });

  it("rejects tampered citation identifiers", () => {
    const context = createBriefGrounding(baseInput);
    const brief = generateDeterministicBrief(context, "2026-07-18T10:00:00.000Z");
    const tampered = structuredClone(brief);
    tampered.priorities[0].evidenceIds = ["src-unapproved-evidence"];

    expect(() => validateBriefGrounding(tampered, context)).toThrow(
      /cited unapproved evidence/,
    );
  });

  it("enforces ten generations per rolling hour", () => {
    const identity = `brief-rate-test-${crypto.randomUUID()}`;
    const now = Date.UTC(2026, 6, 18, 10, 0, 0);

    for (let count = 0; count < 10; count += 1) {
      expect(consumeBriefRateLimit(identity, { now }).allowed).toBe(true);
    }
    expect(consumeBriefRateLimit(identity, { now }).allowed).toBe(false);
  });
});

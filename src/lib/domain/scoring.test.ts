import { describe, expect, it } from "vitest";

import {
  calculateOpportunityFit,
  calculateThreatPriority,
  getScoreBand,
  OPPORTUNITY_FIT_WEIGHTS,
  THREAT_PRIORITY_WEIGHTS,
} from "./scoring";
import type { ThreatScoreInputs } from "./types";

describe("domain scoring", () => {
  it("keeps each score model normalised to 100 percent", () => {
    expect(Object.values(THREAT_PRIORITY_WEIGHTS).reduce((sum, value) => sum + value, 0)).toBe(
      100,
    );
    expect(Object.values(OPPORTUNITY_FIT_WEIGHTS).reduce((sum, value) => sum + value, 0)).toBe(
      100,
    );
  });

  it("normalises zero and maximum ratings to the 0 to 100 range", () => {
    expect(
      calculateThreatPriority({
        impact: 0,
        momentum: 0,
        prevalence: 0,
        regulatoryUrgency: 0,
        evidenceConfidence: 0,
      }),
    ).toBe(0);

    expect(
      calculateOpportunityFit({
        capabilityMatch: 5,
        installedBaseAdjacency: 5,
        maturityGap: 5,
        engagementTiming: 5,
        proofAsset: 5,
      }),
    ).toBe(100);
  });

  it("applies the approved threat weights without averaging the two scores", () => {
    expect(
      calculateThreatPriority({
        impact: 5,
        momentum: 4,
        prevalence: 3,
        regulatoryUrgency: 2,
        evidenceConfidence: 1,
      }),
    ).toBe(70);

    expect(
      calculateOpportunityFit({
        capabilityMatch: 1,
        installedBaseAdjacency: 2,
        maturityGap: 3,
        engagementTiming: 4,
        proofAsset: 5,
      }),
    ).toBe(50);
  });

  it("rejects an out-of-range runtime rating", () => {
    const invalid = {
      impact: 6,
      momentum: 4,
      prevalence: 3,
      regulatoryUrgency: 2,
      evidenceConfidence: 1,
    } as unknown as ThreatScoreInputs;

    expect(() => calculateThreatPriority(invalid)).toThrow(RangeError);
  });

  it("returns stable display bands", () => {
    expect(getScoreBand(0)).toBe("low");
    expect(getScoreBand(50)).toBe("moderate");
    expect(getScoreBand(70)).toBe("high");
    expect(getScoreBand(85)).toBe("very-high");
    expect(() => getScoreBand(101)).toThrow(RangeError);
  });
});

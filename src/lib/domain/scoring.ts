import type {
  OpportunityScoreInputs,
  Rating,
  ThreatScoreInputs,
} from "./types";

export const THREAT_PRIORITY_WEIGHTS = {
  impact: 30,
  momentum: 25,
  prevalence: 20,
  regulatoryUrgency: 15,
  evidenceConfidence: 10,
} as const;

export const OPPORTUNITY_FIT_WEIGHTS = {
  capabilityMatch: 30,
  installedBaseAdjacency: 25,
  maturityGap: 20,
  engagementTiming: 15,
  proofAsset: 10,
} as const;

export type ScoreBand = "low" | "moderate" | "high" | "very-high";

function assertRating(name: string, value: Rating): void {
  if (!Number.isInteger(value) || value < 0 || value > 5) {
    throw new RangeError(`${name} must be an integer from 0 to 5.`);
  }
}

function weightedScore<T extends string>(
  values: Record<T, Rating>,
  weights: Record<T, number>,
): number {
  const weightedTotal = (Object.keys(weights) as T[]).reduce((total, key) => {
    const value = values[key];
    assertRating(key, value);
    return total + value * weights[key];
  }, 0);

  return Math.round(weightedTotal / 5);
}

export function calculateThreatPriority(inputs: ThreatScoreInputs): number {
  return weightedScore(inputs, THREAT_PRIORITY_WEIGHTS);
}

export function calculateOpportunityFit(inputs: OpportunityScoreInputs): number {
  return weightedScore(inputs, OPPORTUNITY_FIT_WEIGHTS);
}

export function getScoreBand(score: number): ScoreBand {
  if (!Number.isFinite(score) || score < 0 || score > 100) {
    throw new RangeError("Score must be a number from 0 to 100.");
  }

  if (score >= 85) return "very-high";
  if (score >= 70) return "high";
  if (score >= 50) return "moderate";
  return "low";
}

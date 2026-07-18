import {
  hydrateBriefOutput,
  type BriefGroundingContext,
} from "./grounding";
import type { BriefModelOutput, BriefOutput } from "./schema";

const sectorLabels: Record<BriefGroundingContext["input"]["sector"], string> = {
  "financial-services": "financial services",
  "critical-infrastructure": "critical infrastructure",
  "manufacturing-ot": "manufacturing and operational technology",
};

const objectiveLabels: Record<BriefGroundingContext["input"]["objective"], string> = {
  "prioritize-cyber-investment": "prioritize cybersecurity investment",
  "reduce-ransomware-risk": "reduce ransomware risk",
  "strengthen-identity": "strengthen identity security",
  "meet-regulatory-obligations": "support regulatory obligations",
  "secure-hybrid-cloud": "secure hybrid-cloud access",
  "improve-incident-readiness": "improve incident readiness",
};

function truncate(value: string, maximum: number) {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length <= maximum) return normalized;
  return `${normalized.slice(0, maximum - 1).trimEnd()}…`;
}

function sentence(value: string) {
  const normalized = value.trim();
  return /[.!?]$/.test(normalized) ? normalized : `${normalized}.`;
}

function createModelOutput(context: BriefGroundingContext): BriefModelOutput {
  const sector = sectorLabels[context.input.sector];
  const objective = objectiveLabels[context.input.objective];
  const trendNames = context.trends.map((trend) => trend.title).join(", ");

  return {
    executiveSummary: truncate(
      `${context.country.name}'s reviewed evidence highlights ${trendNames}. For a ${sector} organization at the ${context.input.maturity} maturity stage, the conversation should ${objective}, connect each risk to a measurable security outcome, and validate priorities through focused discovery before proposing architecture changes.`,
      900,
    ),
    priorities: context.trends.map((trend) => {
      const impact = trend.customerImpact[0]
        ? `Customer implication: ${sentence(trend.customerImpact[0])}`
        : "Customer implication: validate exposure, control coverage, and response readiness.";
      const regulation = trend.regulatoryNote
        ? ` Regulatory context: ${sentence(trend.regulatoryNote)}`
        : "";

      return {
        trendId: trend.id,
        narrative: truncate(
          `${sentence(trend.summary)} ${impact}${regulation} Use discovery to confirm relevance before positioning an outcome or product.`,
          520,
        ),
        evidenceIds: trend.evidence.map((evidence) => evidence.id),
      };
    }),
    nextSteps: [
      `Confirm which of the ${context.trends.length} selected signals materially affects the customer's ${sector} environment.`,
      `Baseline current control coverage and operational ownership against the ${context.input.maturity} maturity stage.`,
      `Run the highest-priority recommended workshop and agree measurable validation criteria before a product demonstration.`,
    ],
    caveats: [
      "Evidence reflects each publisher's stated observation period and may not represent current incident volume.",
      "Country-level metrics use different definitions and collection methods and are not normalized for direct comparison.",
      "Validate regulatory interpretation and customer-specific obligations with qualified legal and compliance stakeholders.",
    ],
  };
}

export function generateDeterministicBrief(
  context: BriefGroundingContext,
  generatedAt?: string,
): BriefOutput {
  return hydrateBriefOutput(createModelOutput(context), context, {
    generator: "deterministic",
    model: null,
    generatedAt,
  });
}

import { z } from "zod";

const safeId = z
  .string()
  .min(2)
  .max(128)
  .regex(/^[A-Za-z0-9][A-Za-z0-9:_-]*$/, "Use a stable opaque identifier");

const boundedText = (minimum: number, maximum: number) =>
  z.string().trim().min(minimum).max(maximum);

export const CountryCodeSchema = z.enum(["SG", "MY", "ID"]);
export const SectorSchema = z.enum([
  "financial-services",
  "critical-infrastructure",
  "manufacturing-ot",
]);
export const MaturitySchema = z.enum([
  "foundational",
  "developing",
  "established",
  "advanced",
]);
export const EngagementStageSchema = z.enum([
  "discovery",
  "qualification",
  "technical-validation",
  "roadmap",
]);
export const BriefObjectiveSchema = z.enum([
  "prioritize-cyber-investment",
  "reduce-ransomware-risk",
  "strengthen-identity",
  "meet-regulatory-obligations",
  "secure-hybrid-cloud",
  "improve-incident-readiness",
]);
export const EnvironmentFlagSchema = z.enum([
  "hybrid-work",
  "hybrid-cloud",
  "multi-cloud",
  "ot-ics",
  "regulated-data",
  "third-party-access",
  "ai-applications",
]);
export const CiscoCapabilityFlagSchema = z.enum([
  "identity",
  "secure-access",
  "network-security",
  "detection-response",
  "security-analytics",
  "ot-security",
  "vulnerability-management",
]);

export const BriefInputSchema = z
  .object({
    country: CountryCodeSchema,
    sector: SectorSchema,
    maturity: MaturitySchema,
    environmentFlags: z.array(EnvironmentFlagSchema).max(7),
    currentCiscoCapabilityFlags: z.array(CiscoCapabilityFlagSchema).max(7),
    engagementStage: EngagementStageSchema,
    objective: BriefObjectiveSchema,
    trendIds: z.array(safeId).min(1).max(5),
  })
  .strict()
  .superRefine((input, context) => {
    if (new Set(input.trendIds).size !== input.trendIds.length) {
      context.addIssue({
        code: "custom",
        message: "Trend identifiers must be unique",
        path: ["trendIds"],
      });
    }

    if (new Set(input.environmentFlags).size !== input.environmentFlags.length) {
      context.addIssue({
        code: "custom",
        message: "Environment flags must be unique",
        path: ["environmentFlags"],
      });
    }

    if (
      new Set(input.currentCiscoCapabilityFlags).size !==
      input.currentCiscoCapabilityFlags.length
    ) {
      context.addIssue({
        code: "custom",
        message: "Cisco capability flags must be unique",
        path: ["currentCiscoCapabilityFlags"],
      });
    }
  });

export type BriefInput = z.infer<typeof BriefInputSchema>;
export type CountryCode = z.infer<typeof CountryCodeSchema>;

export const BriefProductReferenceSchema = z
  .object({
    id: safeId,
    name: boundedText(2, 120),
    url: z.url({ protocol: /^https$/ }),
  })
  .strict();

export const BriefWorkshopSchema = z
  .object({
    name: boundedText(3, 160),
    format: boundedText(2, 80),
    duration: boundedText(2, 40),
    objective: boundedText(10, 320),
    outputs: z.array(boundedText(3, 160)).min(1).max(4),
  })
  .strict();

export const BriefPrioritySchema = z
  .object({
    trendId: safeId,
    title: boundedText(3, 180),
    narrative: boundedText(40, 520),
    evidenceIds: z.array(safeId).min(1).max(8),
    outcomePlay: z
      .object({
        desiredOutcome: boundedText(5, 240),
        primaryProduct: BriefProductReferenceSchema,
        supportingProducts: z.array(BriefProductReferenceSchema).max(2),
      })
      .strict(),
    discoveryQuestions: z.array(boundedText(8, 220)).min(1).max(3),
    recommendedWorkshop: BriefWorkshopSchema,
  })
  .strict();

export const BriefCitationSchema = z
  .object({
    evidenceId: safeId,
    title: boundedText(3, 240),
    nativeTitle: boundedText(2, 240).nullable(),
    publisher: boundedText(2, 120),
    url: z.url({ protocol: /^https$/ }),
    publishedOn: z.iso.date().nullable(),
    observationPeriod: boundedText(2, 120),
    claim: boundedText(10, 800),
  })
  .strict();

export const BriefOutputSchema = z
  .object({
    id: safeId,
    generatedAt: z.iso.datetime({ offset: true }),
    generator: z.enum(["openai", "deterministic"]),
    model: boundedText(2, 80).nullable(),
    title: boundedText(4, 180),
    country: CountryCodeSchema,
    countryName: boundedText(2, 80),
    sector: SectorSchema,
    maturity: MaturitySchema,
    objective: BriefObjectiveSchema,
    selectedTrendIds: z.array(safeId).min(1).max(5),
    executiveSummary: boundedText(80, 900),
    priorities: z.array(BriefPrioritySchema).min(1).max(5),
    nextSteps: z.array(boundedText(8, 240)).min(1).max(4),
    caveats: z.array(boundedText(8, 280)).min(1).max(4),
    citations: z.array(BriefCitationSchema).min(1).max(20),
    reviewedForSharing: z.boolean(),
    disclaimer: boundedText(20, 400),
  })
  .strict();

export type BriefOutput = z.infer<typeof BriefOutputSchema>;
export type BriefPriority = z.infer<typeof BriefPrioritySchema>;
export type BriefCitation = z.infer<typeof BriefCitationSchema>;

/**
 * The model is deliberately limited to prose and opaque approved identifiers.
 * Titles, citations, product facts, questions and workshops are rehydrated from
 * trusted application data after generation.
 */
export const BriefModelOutputSchema = z
  .object({
    executiveSummary: boundedText(80, 900),
    priorities: z
      .array(
        z
          .object({
            trendId: safeId,
            narrative: boundedText(40, 520),
            evidenceIds: z.array(safeId).min(1).max(8),
          })
          .strict(),
      )
      .min(1)
      .max(5),
    nextSteps: z.array(boundedText(8, 240)).min(1).max(4),
    caveats: z.array(boundedText(8, 280)).min(1).max(4),
  })
  .strict();

export type BriefModelOutput = z.infer<typeof BriefModelOutputSchema>;

export const BriefIdSchema = safeId;

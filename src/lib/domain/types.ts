export type CountryCode = "SG" | "MY" | "ID";

export type Rating = 0 | 1 | 2 | 3 | 4 | 5;

export type ConfidenceLevel = "high" | "medium" | "low";

export type SourceStatus =
  | "discovered"
  | "fetched"
  | "needs_review"
  | "approved"
  | "rejected"
  | "stale"
  | "archived";

export type TrendStatus = "draft" | "in_review" | "published" | "archived";

export type SourceRole =
  | "observed_trend"
  | "operational_alert"
  | "incident_case"
  | "regulatory_trigger"
  | "control_guidance";

export type MetricKind =
  | "reported_incidents"
  | "detected_infrastructure"
  | "unique_ips"
  | "phishing_attempts"
  | "ransomware_activities"
  | "affected_entities"
  | "qualitative";

export type SectorId =
  | "financial-services"
  | "critical-infrastructure"
  | "manufacturing-ot";

export type TrendCategory =
  | "Advanced threats"
  | "Critical infrastructure"
  | "Exposure management"
  | "Identity and fraud"
  | "Operational resilience"
  | "Ransomware"
  | "Regulation";

export type TrendDirection = "rising" | "persistent" | "evolving" | "regulatory";

export interface ObservationPeriod {
  label: string;
  start?: string;
  end?: string;
}

export interface Country {
  id: CountryCode;
  code: CountryCode;
  slug: string;
  name: string;
  localName: string;
  regulator: string;
  summary: string;
}

export interface EvidenceMetric {
  value: number;
  unit: string;
  qualifier?: string;
  comparison?: string;
}

export interface EvidenceSource {
  id: string;
  slug: string;
  country: CountryCode;
  title: string;
  nativeTitle?: string;
  publisher: string;
  url: string;
  publishedOn?: string;
  observationPeriod: ObservationPeriod;
  language: "English" | "Malay" | "Indonesian";
  role: SourceRole;
  metricKind: MetricKind;
  claim: string;
  metric?: EvidenceMetric;
  confidence: ConfidenceLevel;
  lastReviewedOn: string;
  status: SourceStatus;
}

export interface ThreatScoreInputs {
  impact: Rating;
  momentum: Rating;
  prevalence: Rating;
  regulatoryUrgency: Rating;
  evidenceConfidence: Rating;
}

export interface OpportunityScoreInputs {
  capabilityMatch: Rating;
  installedBaseAdjacency: Rating;
  maturityGap: Rating;
  engagementTiming: Rating;
  proofAsset: Rating;
}

export interface TrendScoreInputs {
  threat: ThreatScoreInputs;
  opportunity: OpportunityScoreInputs;
}

export interface Workshop {
  name: string;
  format: "discovery" | "assessment" | "tabletop" | "architecture";
  duration: string;
  objective: string;
  outputs: readonly string[];
}

export interface Trend {
  id: string;
  slug: string;
  country: CountryCode;
  title: string;
  summary: string;
  category: TrendCategory;
  direction: TrendDirection;
  sectors: readonly SectorId[];
  observationPeriod: ObservationPeriod;
  sourceIds: readonly string[];
  customerImpact: readonly string[];
  regulatoryNote?: string;
  discoveryQuestions: readonly string[];
  workshop: Workshop;
  scoreInputs: TrendScoreInputs;
  threatPriority: number;
  opportunityFit: number;
  status: TrendStatus;
  lastReviewedOn: string;
}

export interface CiscoProduct {
  id: string;
  slug: string;
  name: string;
  category: string;
  outcome: string;
  description: string;
  url: string;
  reviewCadence: "monthly";
  lastReviewedOn: string;
}

export interface TrendProductMapping {
  trendId: string;
  primaryProductId: string;
  supportingProductIds: readonly string[];
  controlOutcome: string;
  positioning: string;
  disclaimer: string;
}

export interface ResolvedTrendProducts {
  mapping: TrendProductMapping;
  primary: CiscoProduct;
  supporting: readonly CiscoProduct[];
}

export interface CountryRegionalStats {
  country: Country;
  trendCount: number;
  averageThreatPriority: number;
  averageOpportunityFit: number;
  topTrend: Trend;
}

export interface RegionalStats {
  countryCount: number;
  trendCount: number;
  sourceCount: number;
  productCount: number;
  highPriorityCount: number;
  averageThreatPriority: number;
  averageOpportunityFit: number;
  lastReviewedOn: string;
  countries: readonly CountryRegionalStats[];
}

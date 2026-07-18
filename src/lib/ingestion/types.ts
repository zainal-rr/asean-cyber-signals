export const ADAPTER_IDS = [
  "sg_csa",
  "my_mycert",
  "my_csm_mirror",
  "my_nacsa",
  "id_idsirtii",
  "id_bssn_publications",
] as const;

export type AdapterId = (typeof ADAPTER_IDS)[number];

export type SourceCountry = "SG" | "MY" | "ID";

export type SourceTargetKind =
  | "listing"
  | "sitemap"
  | "statistics"
  | "publication_index";

export type SourceTarget = {
  id: string;
  label: string;
  url: string;
  kind: SourceTargetKind;
  cadenceMinutes: number;
  expectedMimeTypes: readonly string[];
  maxDocumentBytes: number;
};

export type SourceAdapterDefinition = {
  id: AdapterId;
  country: SourceCountry;
  publisher: string;
  allowedHosts: readonly string[];
  shadowDays: 14;
  fallbackFor?: AdapterId;
  targets: readonly SourceTarget[];
};

export type SourceHealth =
  | "shadow"
  | "healthy"
  | "degraded"
  | "quarantined";

export type ProbeFailureCode =
  | "invalid_url"
  | "protocol_not_allowed"
  | "credentials_not_allowed"
  | "port_not_allowed"
  | "host_not_allowlisted"
  | "dns_resolution_failed"
  | "non_public_address"
  | "redirect_missing_location"
  | "redirect_limit_exceeded"
  | "unexpected_content_type"
  | "document_too_large"
  | "magic_bytes_mismatch"
  | "http_error"
  | "timeout"
  | "network_error";

export type ProbeSuccess = {
  ok: true;
  targetId: string;
  canonicalUrl: string;
  checkedAt: string;
  httpStatus: number;
  contentType: string;
  contentLength: number | null;
  probeBytes: number;
  contentHash: string;
  etag: string | null;
  lastModified: string | null;
  notModified: boolean;
};

export type ProbeFailure = {
  ok: false;
  targetId: string;
  checkedAt: string;
  code: ProbeFailureCode;
  retryable: boolean;
  quarantined: boolean;
  httpStatus: number | null;
};

export type SourceProbeResult = ProbeSuccess | ProbeFailure;

export type SourceHealthSnapshot = {
  health: SourceHealth;
  consecutiveFailures: number;
  lastCheckedAt: string;
  lastSuccessfulAt: string | null;
};

export type AdapterRunResult = {
  adapterId: AdapterId;
  country: SourceCountry;
  publisher: string;
  mode: "shadow_discovery";
  status: "succeeded" | "failed" | "quarantined";
  startedAt: string;
  finishedAt: string;
  health: SourceHealthSnapshot;
  checks: SourceProbeResult[];
  nextItemState: "needs_review" | "quarantined" | "no_change";
  autoPublish: false;
};

export type ManualInboxResult = {
  inboxId: string;
  sourceKey: string;
  country: SourceCountry;
  publisher: string;
  submittedUrl: string;
  label: string;
  status: "needs_review" | "quarantined";
  check: SourceProbeResult;
  autoPublish: false;
};

export type DiscoveryAssessment = {
  quarantine: boolean;
  reasons: Array<"zero_results" | "item_count_change_over_50_percent">;
  changeRatio: number | null;
};

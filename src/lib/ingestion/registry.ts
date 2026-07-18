import type {
  AdapterId,
  SourceAdapterDefinition,
} from "./types";

const HTML_MIME = ["text/html", "application/xhtml+xml"] as const;
const XML_MIME = [
  "application/xml",
  "text/xml",
  "application/rss+xml",
  "application/atom+xml",
] as const;
const SIX_MEBIBYTES = 6 * 1024 * 1024;

export const SOURCE_ADAPTERS = {
  sg_csa: {
    id: "sg_csa",
    country: "SG",
    publisher: "Cyber Security Agency of Singapore",
    allowedHosts: ["www.csa.gov.sg", "csa.gov.sg"],
    shadowDays: 14,
    targets: [
      {
        id: "publications",
        label: "CSA publications",
        url: "https://www.csa.gov.sg/resources/publications/",
        kind: "listing",
        cadenceMinutes: 240,
        expectedMimeTypes: HTML_MIME,
        maxDocumentBytes: SIX_MEBIBYTES,
      },
      {
        id: "press-releases",
        label: "CSA press releases",
        url: "https://www.csa.gov.sg/news-events/press-releases/",
        kind: "listing",
        cadenceMinutes: 240,
        expectedMimeTypes: HTML_MIME,
        maxDocumentBytes: SIX_MEBIBYTES,
      },
      {
        id: "legislation",
        label: "CSA legislation and regulation",
        url: "https://www.csa.gov.sg/legislation/",
        kind: "listing",
        cadenceMinutes: 1440,
        expectedMimeTypes: HTML_MIME,
        maxDocumentBytes: SIX_MEBIBYTES,
      },
    ],
  },
  my_mycert: {
    id: "my_mycert",
    country: "MY",
    publisher: "Malaysia Computer Emergency Response Team",
    allowedHosts: ["mycert.org.my", "www.mycert.org.my"],
    shadowDays: 14,
    targets: [
      {
        id: "advisories",
        label: "MyCERT advisories",
        url: "https://mycert.org.my/portal/advisories",
        kind: "listing",
        cadenceMinutes: 240,
        expectedMimeTypes: HTML_MIME,
        maxDocumentBytes: SIX_MEBIBYTES,
      },
      {
        id: "statistics",
        label: "MyCERT incident statistics",
        url: "https://mycert.org.my/portal/statistics",
        kind: "statistics",
        cadenceMinutes: 1440,
        expectedMimeTypes: HTML_MIME,
        maxDocumentBytes: SIX_MEBIBYTES,
      },
    ],
  },
  my_csm_mirror: {
    id: "my_csm_mirror",
    country: "MY",
    publisher: "CyberSecurity Malaysia",
    allowedHosts: ["www.cybersecurity.my", "cybersecurity.my"],
    shadowDays: 14,
    fallbackFor: "my_mycert",
    targets: [
      {
        id: "advisories-mirror",
        label: "CyberSecurity Malaysia advisories mirror",
        url: "https://www.cybersecurity.my/portal-main/advisories",
        kind: "listing",
        cadenceMinutes: 720,
        expectedMimeTypes: HTML_MIME,
        maxDocumentBytes: SIX_MEBIBYTES,
      },
    ],
  },
  my_nacsa: {
    id: "my_nacsa",
    country: "MY",
    publisher: "National Cyber Security Agency Malaysia",
    allowedHosts: ["www.nacsa.gov.my", "nacsa.gov.my"],
    shadowDays: 14,
    targets: [
      {
        id: "alerts",
        label: "NACSA alerts and advisories",
        url: "https://www.nacsa.gov.my/alert.php",
        kind: "listing",
        cadenceMinutes: 360,
        expectedMimeTypes: HTML_MIME,
        maxDocumentBytes: SIX_MEBIBYTES,
      },
      {
        id: "act-854",
        label: "Cyber Security Act 2024",
        url: "https://www.nacsa.gov.my/act854.php",
        kind: "listing",
        cadenceMinutes: 1440,
        expectedMimeTypes: HTML_MIME,
        maxDocumentBytes: SIX_MEBIBYTES,
      },
      {
        id: "ncii",
        label: "National Critical Information Infrastructure sectors",
        url: "https://www.nacsa.gov.my/NCII.php",
        kind: "listing",
        cadenceMinutes: 1440,
        expectedMimeTypes: HTML_MIME,
        maxDocumentBytes: SIX_MEBIBYTES,
      },
    ],
  },
  id_idsirtii: {
    id: "id_idsirtii",
    country: "ID",
    publisher: "Indonesia Security Incident Response Team on Internet Infrastructure",
    allowedHosts: ["www.idsirtii.or.id", "idsirtii.or.id"],
    shadowDays: 14,
    targets: [
      {
        id: "warnings",
        label: "Id-SIRTII security warnings",
        url: "https://www.idsirtii.or.id/peringatan.html",
        kind: "listing",
        cadenceMinutes: 360,
        expectedMimeTypes: HTML_MIME,
        maxDocumentBytes: SIX_MEBIBYTES,
      },
    ],
  },
  id_bssn_publications: {
    id: "id_bssn_publications",
    country: "ID",
    publisher: "Badan Siber dan Sandi Negara",
    allowedHosts: ["gate.bssn.go.id", "www.bssn.go.id", "bssn.go.id"],
    shadowDays: 14,
    targets: [
      {
        id: "cyber-landscape-publications",
        label: "BSSN cyber landscape publications",
        url: "https://gate.bssn.go.id/ppid-document/Informasi-serta-merta/lanskap-keamanan-siber-indonesia",
        kind: "publication_index",
        cadenceMinutes: 10080,
        expectedMimeTypes: [...HTML_MIME, ...XML_MIME],
        maxDocumentBytes: SIX_MEBIBYTES,
      },
    ],
  },
} as const satisfies Record<AdapterId, SourceAdapterDefinition>;

export type ManualSourceDefinition = {
  sourceKey: string;
  country: "SG" | "MY" | "ID";
  publisher: string;
  allowedHosts: readonly string[];
};

export const MANUAL_INBOX_SOURCES = [
  {
    sourceKey: "id_manual_official",
    country: "ID",
    publisher: "Indonesian government and financial regulators",
    allowedHosts: [
      "www.komdigi.go.id",
      "komdigi.go.id",
      "jdih.komdigi.go.id",
      "www.ojk.go.id",
      "ojk.go.id",
    ],
  },
] as const satisfies readonly ManualSourceDefinition[];

export function isAdapterId(value: string): value is AdapterId {
  return Object.hasOwn(SOURCE_ADAPTERS, value);
}

export function getSourceAdapter(id: AdapterId) {
  return SOURCE_ADAPTERS[id];
}

export function listSourceAdapters() {
  return Object.values(SOURCE_ADAPTERS);
}

export function resolveManualInboxSource(rawUrl: string): ManualSourceDefinition | null {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }

  if (
    parsed.protocol !== "https:" ||
    parsed.username ||
    parsed.password ||
    (parsed.port && parsed.port !== "443")
  ) {
    return null;
  }
  const hostname = parsed.hostname.toLowerCase();

  const manualSource = MANUAL_INBOX_SOURCES.find((source) =>
    source.allowedHosts.includes(hostname as never),
  );
  if (manualSource) return manualSource;

  const adapter = listSourceAdapters().find((candidate) =>
    candidate.allowedHosts.includes(hostname as never),
  );
  if (!adapter) return null;

  return {
    sourceKey: adapter.id,
    country: adapter.country,
    publisher: adapter.publisher,
    allowedHosts: adapter.allowedHosts,
  };
}

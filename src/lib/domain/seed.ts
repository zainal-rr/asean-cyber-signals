import {
  calculateOpportunityFit,
  calculateThreatPriority,
} from "./scoring";
import type {
  CiscoProduct,
  Country,
  CountryCode,
  EvidenceSource,
  RegionalStats,
  ResolvedTrendProducts,
  Trend,
  TrendProductMapping,
} from "./types";

const LAST_REVIEWED_ON = "2026-07-18";
const POSITIONING_DISCLAIMER =
  "Cisco capabilities can support the stated control outcomes. They do not by themselves guarantee compliance or eliminate cyber risk.";

export const countries: readonly Country[] = [
  {
    id: "SG",
    code: "SG",
    slug: "singapore",
    name: "Singapore",
    localName: "Singapore",
    regulator: "Cyber Security Agency of Singapore",
    summary:
      "A mature digital economy balancing persistent ransomware and advanced threats with expanded critical infrastructure oversight.",
  },
  {
    id: "MY",
    code: "MY",
    slug: "malaysia",
    name: "Malaysia",
    localName: "Malaysia",
    regulator: "National Cyber Security Agency",
    summary:
      "A fraud-heavy threat environment with new National Cyber Security Act duties across eleven NCII sectors.",
  },
  {
    id: "ID",
    code: "ID",
    slug: "indonesia",
    name: "Indonesia",
    localName: "Indonesia",
    regulator: "Badan Siber dan Sandi Negara",
    summary:
      "A large and distributed digital environment prioritising identity protection, ransomware resilience and vital infrastructure.",
  },
];

export const sources: readonly EvidenceSource[] = [
  {
    id: "src-sg-ransomware-2025",
    slug: "singapore-ransomware-reports-2025",
    country: "SG",
    title: "Singapore Cyber Landscape 2025/2026: ransomware reports",
    publisher: "Cyber Security Agency of Singapore",
    url: "https://www.csa.gov.sg/resources/publications/singapore-cyber-landscape-2025-2026/",
    observationPeriod: {
      label: "Calendar year 2025",
      start: "2025-01-01",
      end: "2025-12-31",
    },
    language: "English",
    role: "observed_trend",
    metricKind: "reported_incidents",
    claim:
      "CSA recorded 165 ransomware reports in 2025, compared with 159 in 2024, indicating continued pressure rather than a clear decline.",
    metric: {
      value: 165,
      unit: "ransomware reports",
      comparison: "159 reports in 2024",
    },
    confidence: "high",
    lastReviewedOn: LAST_REVIEWED_ON,
    status: "approved",
  },
  {
    id: "src-sg-infected-systems-2025",
    slug: "singapore-infected-systems-2025",
    country: "SG",
    title: "Singapore Cyber Landscape 2025/2026: infected systems",
    publisher: "Cyber Security Agency of Singapore",
    url: "https://www.csa.gov.sg/resources/publications/singapore-cyber-landscape-2025-2026/",
    observationPeriod: {
      label: "Calendar year 2025",
      start: "2025-01-01",
      end: "2025-12-31",
    },
    language: "English",
    role: "observed_trend",
    metricKind: "detected_infrastructure",
    claim:
      "CSA observed about 284,300 infected systems in Singapore in 2025, a 142 percent increase from 2024. This is a detection measure, not a count of victim organisations.",
    metric: {
      value: 284300,
      unit: "infected systems observed",
      comparison: "142 percent increase from 2024",
      qualifier: "Detections, not unique victim organisations",
    },
    confidence: "high",
    lastReviewedOn: LAST_REVIEWED_ON,
    status: "approved",
  },
  {
    id: "src-sg-phishing-2025",
    slug: "singapore-phishing-2025",
    country: "SG",
    title: "Singapore Cyber Landscape 2025/2026: phishing",
    publisher: "Cyber Security Agency of Singapore",
    url: "https://www.csa.gov.sg/resources/publications/singapore-cyber-landscape-2025-2026/",
    observationPeriod: {
      label: "Calendar year 2025",
      start: "2025-01-01",
      end: "2025-12-31",
    },
    language: "English",
    role: "observed_trend",
    metricKind: "phishing_attempts",
    claim:
      "CSA recorded about 4,800 phishing attempts in 2025, 21 percent fewer than in 2024, while warning that campaigns had become more convincing and sophisticated.",
    metric: {
      value: 4800,
      unit: "phishing attempts",
      comparison: "21 percent lower than 2024",
      qualifier: "Approximate published figure",
    },
    confidence: "high",
    lastReviewedOn: LAST_REVIEWED_ON,
    status: "approved",
  },
  {
    id: "src-sg-unc3886-telecommunications",
    slug: "singapore-unc3886-telecommunications",
    country: "SG",
    title: "Multi-agency operation against UNC3886 in the telecommunications sector",
    publisher: "Cyber Security Agency of Singapore",
    url: "https://www.csa.gov.sg/news-events/press-releases/largest-multi-agency-cyber-operation-mounted-to-counter-threat-posed-by-advanced-persistent-threat--apt--actor-unc3886-to-singapore-s-telecommunications-sector/",
    publishedOn: "2025-07-18",
    observationPeriod: {
      label: "Operation disclosed in July 2025",
      end: "2025-07-18",
    },
    language: "English",
    role: "incident_case",
    metricKind: "affected_entities",
    claim:
      "Singapore disclosed a multi-agency operation against UNC3886 after the advanced threat actor targeted all four major telecommunications operators.",
    metric: {
      value: 4,
      unit: "major telecommunications operators targeted",
      qualifier: "Affected-entity count, not incident volume",
    },
    confidence: "high",
    lastReviewedOn: LAST_REVIEWED_ON,
    status: "approved",
  },
  {
    id: "src-sg-cybersecurity-act-2025",
    slug: "singapore-cybersecurity-act-amendment-2025",
    country: "SG",
    title: "Cybersecurity Amendment Act provisions in force",
    publisher: "Cyber Security Agency of Singapore",
    url: "https://www.csa.gov.sg/news-events/press-releases/provisions-in-the-cybersecurity--amendment--act-to-come-into-force-on-31-october-2025/",
    publishedOn: "2025-10-30",
    observationPeriod: {
      label: "In force from 31 October 2025",
      start: "2025-10-31",
    },
    language: "English",
    role: "regulatory_trigger",
    metricKind: "qualitative",
    claim:
      "Key provisions of the Cybersecurity Amendment Act took effect on 31 October 2025, expanding the cyber oversight framework and incident reporting expectations for regulated entities.",
    confidence: "high",
    lastReviewedOn: LAST_REVIEWED_ON,
    status: "approved",
  },
  {
    id: "src-my-cyber999-fraud-2025",
    slug: "malaysia-cyber999-fraud-2025",
    country: "MY",
    title: "Cyber999 incident statistics: fraud",
    publisher: "CyberSecurity Malaysia",
    url: "https://www.cybersecurity.my/portal-main/statistics-details?id=24",
    observationPeriod: {
      label: "Calendar year 2025",
      start: "2025-01-01",
      end: "2025-12-31",
    },
    language: "English",
    role: "observed_trend",
    metricKind: "reported_incidents",
    claim:
      "Cyber999 recorded 5,751 fraud reports among 7,616 total reports in 2025, making fraud the dominant reported category.",
    metric: {
      value: 5751,
      unit: "fraud reports",
      comparison: "7,616 total Cyber999 reports in 2025",
    },
    confidence: "high",
    lastReviewedOn: LAST_REVIEWED_ON,
    status: "approved",
  },
  {
    id: "src-my-cyber999-intrusion-2025",
    slug: "malaysia-cyber999-intrusion-2025",
    country: "MY",
    title: "Cyber999 incident statistics: intrusion",
    publisher: "CyberSecurity Malaysia",
    url: "https://www.cybersecurity.my/portal-main/statistics-details?id=24",
    observationPeriod: {
      label: "Calendar year 2025",
      start: "2025-01-01",
      end: "2025-12-31",
    },
    language: "English",
    role: "observed_trend",
    metricKind: "reported_incidents",
    claim:
      "Cyber999 recorded 542 intrusion reports in 2025, showing that unauthorised access remains a material operational concern alongside fraud.",
    metric: {
      value: 542,
      unit: "intrusion reports",
      qualifier: "Reports received by Cyber999",
    },
    confidence: "high",
    lastReviewedOn: LAST_REVIEWED_ON,
    status: "approved",
  },
  {
    id: "src-my-act854-notification",
    slug: "malaysia-act-854-incident-notification",
    country: "MY",
    title: "National Cyber Security Act 2024: incident notification",
    nativeTitle: "Akta Keselamatan Siber 2024: pemberitahuan insiden",
    publisher: "National Cyber Security Agency",
    url: "https://www.nacsa.gov.my/act854.php",
    observationPeriod: {
      label: "In force from 26 August 2024",
      start: "2024-08-26",
    },
    language: "Malay",
    role: "regulatory_trigger",
    metricKind: "qualitative",
    claim:
      "Act 854 and its implementing direction require an NCII entity to notify NACSA immediately after becoming aware of a cyber incident and provide prescribed particulars within six hours.",
    confidence: "high",
    lastReviewedOn: LAST_REVIEWED_ON,
    status: "approved",
  },
  {
    id: "src-my-act854-assessment-audit",
    slug: "malaysia-act-854-risk-assessment-audit",
    country: "MY",
    title: "National Cyber Security Act 2024: assessment and audit duties",
    nativeTitle: "Akta Keselamatan Siber 2024: penilaian risiko dan audit",
    publisher: "National Cyber Security Agency",
    url: "https://www.nacsa.gov.my/legal.php",
    observationPeriod: {
      label: "Requirements applicable from 26 August 2024",
      start: "2024-08-26",
    },
    language: "Malay",
    role: "regulatory_trigger",
    metricKind: "qualitative",
    claim:
      "The NCII framework requires a cyber security risk assessment at least annually and a cyber security audit at least once every two years.",
    confidence: "high",
    lastReviewedOn: LAST_REVIEWED_ON,
    status: "approved",
  },
  {
    id: "src-my-ncii-sectors",
    slug: "malaysia-eleven-ncii-sectors",
    country: "MY",
    title: "National Critical Information Infrastructure sectors",
    nativeTitle: "Sektor Infrastruktur Maklumat Kritikal Negara",
    publisher: "National Cyber Security Agency",
    url: "https://www.nacsa.gov.my/NCII.php",
    observationPeriod: {
      label: "Current NCII sector framework reviewed July 2026",
      end: LAST_REVIEWED_ON,
    },
    language: "Malay",
    role: "regulatory_trigger",
    metricKind: "affected_entities",
    claim:
      "Malaysia defines eleven NCII sectors, creating a broad need for consistent visibility, segmentation, governance and response planning across regulated environments.",
    metric: {
      value: 11,
      unit: "NCII sectors",
      qualifier: "Sector count, not entity count",
    },
    confidence: "high",
    lastReviewedOn: LAST_REVIEWED_ON,
    status: "approved",
  },
  {
    id: "src-id-bssn-phishing-2024",
    slug: "indonesia-bssn-phishing-2024",
    country: "ID",
    title: "Indonesia Cybersecurity Landscape 2024: phishing activity",
    nativeTitle: "Lanskap Keamanan Siber Indonesia 2024: aktivitas phishing",
    publisher: "Badan Siber dan Sandi Negara",
    url: "https://gate.bssn.go.id/ppid-document/Informasi-serta-merta/lanskap-keamanan-siber-indonesia/Lanskap%20Keamanan%20Siber%20Indonesia%202024.pdf",
    observationPeriod: {
      label: "Calendar year 2024",
      start: "2024-01-01",
      end: "2024-12-31",
    },
    language: "Indonesian",
    role: "observed_trend",
    metricKind: "phishing_attempts",
    claim:
      "BSSN recorded 26,771,610 phishing activities in 2024. The figure represents detected activity, not unique victims or confirmed incidents.",
    metric: {
      value: 26771610,
      unit: "phishing activities",
      qualifier: "Detected activities, not unique victims",
    },
    confidence: "high",
    lastReviewedOn: LAST_REVIEWED_ON,
    status: "approved",
  },
  {
    id: "src-id-bssn-ransomware-2024",
    slug: "indonesia-bssn-ransomware-2024",
    country: "ID",
    title: "Indonesia Cybersecurity Landscape 2024: ransomware activity",
    nativeTitle: "Lanskap Keamanan Siber Indonesia 2024: aktivitas ransomware",
    publisher: "Badan Siber dan Sandi Negara",
    url: "https://gate.bssn.go.id/ppid-document/Informasi-serta-merta/lanskap-keamanan-siber-indonesia/Lanskap%20Keamanan%20Siber%20Indonesia%202024.pdf",
    observationPeriod: {
      label: "Calendar year 2024",
      start: "2024-01-01",
      end: "2024-12-31",
    },
    language: "Indonesian",
    role: "observed_trend",
    metricKind: "ransomware_activities",
    claim:
      "BSSN recorded 514,508 ransomware activities in 2024. The measure is activity telemetry and must not be presented as a victim count.",
    metric: {
      value: 514508,
      unit: "ransomware activities",
      qualifier: "Activity telemetry, not unique victims",
    },
    confidence: "high",
    lastReviewedOn: LAST_REVIEWED_ON,
    status: "approved",
  },
  {
    id: "src-id-pdns2-recovery-2024",
    slug: "indonesia-pdns2-service-recovery-2024",
    country: "ID",
    title: "PDNS 2 recovery update",
    nativeTitle: "Terapkan Dekripsi PDNS 2, 30 Layanan Publik Telah Pulih",
    publisher: "Kementerian Komunikasi dan Informatika",
    url: "https://www.komdigi.go.id/berita/berita-pemerintahan/detail/terapkan-dekripsi-pdns-2-30-layanan-publik-telah-pulih",
    publishedOn: "2024-07-09",
    observationPeriod: {
      label: "Recovery status reported 9 July 2024",
      end: "2024-07-09",
    },
    language: "Indonesian",
    role: "incident_case",
    metricKind: "affected_entities",
    claim:
      "The government reported that 167 of 282 validated public entities were affected after the PDNS 2 incident and that 30 public services had been restored by 9 July 2024.",
    metric: {
      value: 167,
      unit: "affected public entities",
      comparison: "282 entities validated; 30 public services restored",
      qualifier: "Point-in-time recovery update",
    },
    confidence: "high",
    lastReviewedOn: LAST_REVIEWED_ON,
    status: "approved",
  },
  {
    id: "src-id-pdp-law-transition",
    slug: "indonesia-pdp-law-transition",
    country: "ID",
    title: "Personal Data Protection Law transition",
    nativeTitle: "Undang-Undang Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi",
    publisher: "JDIH Kementerian Komunikasi dan Digital",
    url: "https://jdih.komdigi.go.id/produk_hukum/view/id/832/t/undangundang%2Bnomor%2B27%2Btahun%2B2022",
    publishedOn: "2022-10-17",
    observationPeriod: {
      label: "Two-year transition ended 17 October 2024",
      start: "2022-10-17",
      end: "2024-10-17",
    },
    language: "Indonesian",
    role: "regulatory_trigger",
    metricKind: "qualitative",
    claim:
      "Indonesia's Personal Data Protection Law provided a two-year transition period from enactment, placing data governance and breach readiness into an active accountability phase after 17 October 2024.",
    confidence: "high",
    lastReviewedOn: LAST_REVIEWED_ON,
    status: "approved",
  },
  {
    id: "src-id-vital-information-infrastructure",
    slug: "indonesia-vital-information-infrastructure-protection",
    country: "ID",
    title: "Protection of Vital Information Infrastructure",
    nativeTitle: "Peraturan Presiden Nomor 82 Tahun 2022 tentang Pelindungan Infrastruktur Informasi Vital",
    publisher: "Badan Pemeriksa Keuangan Republik Indonesia",
    url: "https://peraturan.bpk.go.id/Details/211029/perpres-no-82-tahun-2022",
    publishedOn: "2022-09-19",
    observationPeriod: {
      label: "In force from 19 September 2022",
      start: "2022-09-19",
    },
    language: "Indonesian",
    role: "regulatory_trigger",
    metricKind: "qualitative",
    claim:
      "Presidential Regulation 82 of 2022 establishes a national framework for protecting vital information infrastructure and coordinating its cyber resilience.",
    confidence: "high",
    lastReviewedOn: LAST_REVIEWED_ON,
    status: "approved",
  },
];

export const products: readonly CiscoProduct[] = [
  {
    id: "product-duo",
    slug: "cisco-duo",
    name: "Cisco Duo",
    category: "Identity security",
    outcome: "Verify user trust and reduce account takeover risk",
    description:
      "Multi-factor authentication, device trust and access controls that strengthen identity assurance.",
    url: "https://www.cisco.com/site/us/en/products/security/duo/index.html",
    reviewCadence: "monthly",
    lastReviewedOn: LAST_REVIEWED_ON,
  },
  {
    id: "product-identity-intelligence",
    slug: "cisco-identity-intelligence",
    name: "Cisco Identity Intelligence",
    category: "Identity security",
    outcome: "Detect identity risk across the authentication estate",
    description:
      "Identity context and analytics that help teams identify risky accounts, access patterns and identity infrastructure.",
    url: "https://www.cisco.com/site/us/en/solutions/security/identity-intelligence/index.html",
    reviewCadence: "monthly",
    lastReviewedOn: LAST_REVIEWED_ON,
  },
  {
    id: "product-secure-access",
    slug: "cisco-secure-access",
    name: "Cisco Secure Access",
    category: "Security service edge",
    outcome: "Apply consistent access and data controls from any location",
    description:
      "A security service edge platform for zero trust access, web protection and cloud-delivered security controls.",
    url: "https://www.cisco.com/site/us/en/products/security/secure-access/index.html",
    reviewCadence: "monthly",
    lastReviewedOn: LAST_REVIEWED_ON,
  },
  {
    id: "product-xdr",
    slug: "cisco-xdr",
    name: "Cisco XDR",
    category: "Detection and response",
    outcome: "Correlate signals and accelerate investigation and response",
    description:
      "Cross-domain detection and response that brings telemetry, investigation and response actions into one workflow.",
    url: "https://www.cisco.com/site/us/en/products/security/xdr/index.html",
    reviewCadence: "monthly",
    lastReviewedOn: LAST_REVIEWED_ON,
  },
  {
    id: "product-splunk-es",
    slug: "splunk-enterprise-security",
    name: "Splunk Enterprise Security",
    category: "Security analytics",
    outcome: "Centralise security monitoring, investigation and risk analytics",
    description:
      "A SIEM platform for security monitoring, risk-based detection, investigation and compliance reporting workflows.",
    url: "https://www.splunk.com/en_us/products/enterprise-security-essentials.html",
    reviewCadence: "monthly",
    lastReviewedOn: LAST_REVIEWED_ON,
  },
  {
    id: "product-vulnerability-management",
    slug: "cisco-vulnerability-management",
    name: "Cisco Vulnerability Management",
    category: "Exposure management",
    outcome: "Prioritise exposures by business and threat context",
    description:
      "Risk-based vulnerability prioritisation that helps teams focus remediation on exposures most likely to matter.",
    url: "https://www.cisco.com/site/us/en/products/security/vulnerability-management/index.html",
    reviewCadence: "monthly",
    lastReviewedOn: LAST_REVIEWED_ON,
  },
  {
    id: "product-hybrid-mesh-firewall",
    slug: "cisco-hybrid-mesh-firewall",
    name: "Cisco Hybrid Mesh Firewall",
    category: "Network security",
    outcome: "Enforce distributed segmentation and threat protection",
    description:
      "A unified approach to firewall enforcement across data centre, cloud, branch and workload environments.",
    url: "https://www.cisco.com/site/us/en/solutions/security/hybrid-mesh-firewall/index.html",
    reviewCadence: "monthly",
    lastReviewedOn: LAST_REVIEWED_ON,
  },
  {
    id: "product-secure-firewall",
    slug: "cisco-secure-firewall",
    name: "Cisco Secure Firewall",
    category: "Network security",
    outcome: "Control traffic and contain threats at network boundaries",
    description:
      "Firewall and intrusion prevention capabilities for protecting networks, applications and distributed environments.",
    url: "https://www.cisco.com/site/us/en/products/security/firewalls/index.html",
    reviewCadence: "monthly",
    lastReviewedOn: LAST_REVIEWED_ON,
  },
  {
    id: "product-security-cloud-control",
    slug: "cisco-security-cloud-control",
    name: "Cisco Security Cloud Control",
    category: "Security management",
    outcome: "Manage distributed security policy with consistent governance",
    description:
      "Cloud-delivered management for security policy, objects and operational visibility across supported controls.",
    url: "https://www.cisco.com/site/us/en/products/security/security-cloud-control/index.html",
    reviewCadence: "monthly",
    lastReviewedOn: LAST_REVIEWED_ON,
  },
  {
    id: "product-industrial-threat-defense",
    slug: "cisco-industrial-threat-defense",
    name: "Cisco Industrial Threat Defense",
    category: "Industrial security",
    outcome: "Protect industrial operations with visibility and segmentation",
    description:
      "An architecture for industrial visibility, segmentation, secure remote access and threat detection.",
    url: "https://www.cisco.com/site/us/en/products/security/industrial-security/index.html",
    reviewCadence: "monthly",
    lastReviewedOn: LAST_REVIEWED_ON,
  },
  {
    id: "product-cyber-vision",
    slug: "cisco-cyber-vision",
    name: "Cisco Cyber Vision",
    category: "Industrial security",
    outcome: "Discover industrial assets and expose operational cyber risk",
    description:
      "Industrial asset visibility and threat detection designed to provide context without disrupting production operations.",
    url: "https://www.cisco.com/c/en/us/products/collateral/security/cyber-vision/cyber-vision-ds.html",
    reviewCadence: "monthly",
    lastReviewedOn: LAST_REVIEWED_ON,
  },
  {
    id: "product-ai-defense",
    slug: "cisco-ai-defense",
    name: "Cisco AI Defense",
    category: "AI application security",
    outcome: "Discover and protect enterprise AI applications and models",
    description:
      "Security controls for assessing AI models, protecting AI applications and governing AI use across the enterprise.",
    url: "https://www.cisco.com/site/us/en/products/security/ai-defense/index.html",
    reviewCadence: "monthly",
    lastReviewedOn: LAST_REVIEWED_ON,
  },
];

type TrendSeed = Omit<Trend, "threatPriority" | "opportunityFit">;

function defineTrend(seed: TrendSeed): Trend {
  return {
    ...seed,
    threatPriority: calculateThreatPriority(seed.scoreInputs.threat),
    opportunityFit: calculateOpportunityFit(seed.scoreInputs.opportunity),
  };
}

export const trends: readonly Trend[] = [
  defineTrend({
    id: "trend-sg-ransomware-persistence",
    slug: "singapore-ransomware-persistence",
    country: "SG",
    title: "Ransomware pressure remains persistent",
    summary:
      "Ransomware reporting stayed elevated in 2025, reinforcing the need to connect prevention, exposure reduction, detection and recovery preparation.",
    category: "Ransomware",
    direction: "persistent",
    sectors: ["financial-services", "critical-infrastructure", "manufacturing-ot"],
    observationPeriod: {
      label: "Calendar year 2025",
      start: "2025-01-01",
      end: "2025-12-31",
    },
    sourceIds: ["src-sg-ransomware-2025"],
    customerImpact: [
      "Extortion can interrupt customer-facing and operational services.",
      "Disconnected endpoint, network and identity telemetry can slow containment.",
      "Recovery readiness must be exercised before an incident, not assumed from backup status.",
    ],
    discoveryQuestions: [
      "How quickly can your team correlate an identity anomaly with endpoint and network activity?",
      "Which containment actions can analysts safely trigger from a single investigation workflow?",
      "When was the last ransomware tabletop that tested both technical and executive decisions?",
    ],
    workshop: {
      name: "Ransomware response readiness workshop",
      format: "tabletop",
      duration: "90 minutes",
      objective: "Test detection, decision and containment paths against a realistic ransomware scenario.",
      outputs: ["Response gap summary", "Priority telemetry map", "Thirty-day improvement actions"],
    },
    scoreInputs: {
      threat: {
        impact: 5,
        momentum: 4,
        prevalence: 4,
        regulatoryUrgency: 3,
        evidenceConfidence: 5,
      },
      opportunity: {
        capabilityMatch: 5,
        installedBaseAdjacency: 4,
        maturityGap: 4,
        engagementTiming: 4,
        proofAsset: 5,
      },
    },
    status: "published",
    lastReviewedOn: LAST_REVIEWED_ON,
  }),
  defineTrend({
    id: "trend-sg-infected-system-growth",
    slug: "singapore-infected-system-growth",
    country: "SG",
    title: "Infected-system detections rose sharply",
    summary:
      "The rise in observed infected systems highlights exposure across internet-facing, endpoint and workload environments, while remaining distinct from confirmed victim counts.",
    category: "Exposure management",
    direction: "rising",
    sectors: ["financial-services", "critical-infrastructure", "manufacturing-ot"],
    observationPeriod: {
      label: "Calendar year 2025",
      start: "2025-01-01",
      end: "2025-12-31",
    },
    sourceIds: ["src-sg-infected-systems-2025"],
    customerImpact: [
      "Asset blind spots can leave exposed systems outside standard remediation cycles.",
      "Security teams need risk context to distinguish urgent exposure from routine patch volume.",
      "Distributed enforcement creates policy drift when controls are managed in separate silos.",
    ],
    discoveryQuestions: [
      "Can you produce one current inventory of externally exposed assets and their owners?",
      "How do you prioritise vulnerabilities when scanner severity and active threat evidence disagree?",
      "Where are segmentation policies managed across data centre, cloud and branch environments?",
    ],
    workshop: {
      name: "Exposure and enforcement architecture review",
      format: "architecture",
      duration: "90 minutes",
      objective: "Map exposed assets, remediation decisions and distributed enforcement controls.",
      outputs: ["Exposure workflow map", "Control ownership gaps", "Prioritised architecture actions"],
    },
    scoreInputs: {
      threat: {
        impact: 4,
        momentum: 5,
        prevalence: 4,
        regulatoryUrgency: 3,
        evidenceConfidence: 5,
      },
      opportunity: {
        capabilityMatch: 5,
        installedBaseAdjacency: 4,
        maturityGap: 4,
        engagementTiming: 3,
        proofAsset: 4,
      },
    },
    status: "published",
    lastReviewedOn: LAST_REVIEWED_ON,
  }),
  defineTrend({
    id: "trend-sg-phishing-sophistication",
    slug: "singapore-phishing-sophistication",
    country: "SG",
    title: "Lower phishing volume does not mean lower identity risk",
    summary:
      "Reported phishing volume fell in 2025, but increasingly convincing campaigns keep identity assurance and device trust central to risk reduction.",
    category: "Identity and fraud",
    direction: "evolving",
    sectors: ["financial-services", "critical-infrastructure", "manufacturing-ot"],
    observationPeriod: {
      label: "Calendar year 2025",
      start: "2025-01-01",
      end: "2025-12-31",
    },
    sourceIds: ["src-sg-phishing-2025"],
    customerImpact: [
      "More convincing lures increase the chance that a valid account becomes the initial access path.",
      "Legacy multi-factor methods can remain vulnerable to push fatigue and session theft.",
      "Access decisions need identity, device and behavioural context rather than a password check alone.",
    ],
    discoveryQuestions: [
      "Which workforce and privileged-user journeys still depend on phishable authentication?",
      "Can your team identify dormant, shared or unusually behaving identities across applications?",
      "What happens when a trusted user connects from a device that no longer meets policy?",
    ],
    workshop: {
      name: "Identity attack-path assessment",
      format: "assessment",
      duration: "60 minutes",
      objective: "Identify phishable access paths and prioritise stronger identity assurance controls.",
      outputs: ["Authentication journey map", "Identity risk gaps", "Phishing-resistant access roadmap"],
    },
    scoreInputs: {
      threat: {
        impact: 4,
        momentum: 3,
        prevalence: 4,
        regulatoryUrgency: 2,
        evidenceConfidence: 5,
      },
      opportunity: {
        capabilityMatch: 5,
        installedBaseAdjacency: 4,
        maturityGap: 4,
        engagementTiming: 4,
        proofAsset: 5,
      },
    },
    status: "published",
    lastReviewedOn: LAST_REVIEWED_ON,
  }),
  defineTrend({
    id: "trend-sg-apt-telecommunications",
    slug: "singapore-apt-telecommunications",
    country: "SG",
    title: "Advanced threats are targeting telecommunications infrastructure",
    summary:
      "The UNC3886 operation demonstrates the need for persistent visibility, segmentation and coordinated response across high-value infrastructure.",
    category: "Advanced threats",
    direction: "persistent",
    sectors: ["critical-infrastructure"],
    observationPeriod: {
      label: "Operation disclosed in July 2025",
      end: "2025-07-18",
    },
    sourceIds: ["src-sg-unc3886-telecommunications"],
    customerImpact: [
      "Long-dwell intrusions can exploit gaps between network, workload and identity controls.",
      "Critical services require containment options that preserve availability.",
      "Joint operational response depends on shared telemetry and clear escalation paths.",
    ],
    regulatoryNote:
      "Critical infrastructure operators should align technical response evidence with their applicable CSA reporting and coordination duties.",
    discoveryQuestions: [
      "Where could an attacker move between management, workload and operational network zones?",
      "Which high-value systems lack continuous behavioural or network telemetry?",
      "Can analysts contain a compromised segment without creating an unacceptable service outage?",
    ],
    workshop: {
      name: "Advanced-threat segmentation review",
      format: "architecture",
      duration: "120 minutes",
      objective: "Trace plausible intrusion paths and design safe containment boundaries for critical services.",
      outputs: ["Attack-path map", "Telemetry coverage gaps", "Segmentation improvement sequence"],
    },
    scoreInputs: {
      threat: {
        impact: 5,
        momentum: 4,
        prevalence: 3,
        regulatoryUrgency: 5,
        evidenceConfidence: 5,
      },
      opportunity: {
        capabilityMatch: 5,
        installedBaseAdjacency: 4,
        maturityGap: 4,
        engagementTiming: 4,
        proofAsset: 4,
      },
    },
    status: "published",
    lastReviewedOn: LAST_REVIEWED_ON,
  }),
  defineTrend({
    id: "trend-sg-cii-reporting-scope",
    slug: "singapore-cii-reporting-scope",
    country: "SG",
    title: "Expanded cyber oversight raises evidence-readiness expectations",
    summary:
      "The amended Cybersecurity Act broadens oversight and makes timely, defensible incident evidence more important for regulated organisations.",
    category: "Regulation",
    direction: "regulatory",
    sectors: ["financial-services", "critical-infrastructure"],
    observationPeriod: {
      label: "In force from 31 October 2025",
      start: "2025-10-31",
    },
    sourceIds: ["src-sg-cybersecurity-act-2025"],
    customerImpact: [
      "Response teams need clear triggers for regulatory escalation and evidence preservation.",
      "Fragmented logs can delay scoping and make incident particulars harder to substantiate.",
      "Operational exercises should include legal, executive and communications decisions.",
    ],
    regulatoryNote:
      "The exact duties depend on designation and circumstance. Confirm obligations with qualified legal and compliance teams.",
    discoveryQuestions: [
      "How does your response plan identify incidents that require regulatory escalation?",
      "Can analysts reconstruct a defensible incident timeline from retained telemetry?",
      "Which executive and legal stakeholders participate in reporting exercises?",
    ],
    workshop: {
      name: "CII evidence-readiness tabletop",
      format: "tabletop",
      duration: "90 minutes",
      objective: "Exercise incident scoping, evidence collection and regulatory escalation decisions.",
      outputs: ["Escalation decision map", "Evidence requirements checklist", "Response process actions"],
    },
    scoreInputs: {
      threat: {
        impact: 4,
        momentum: 4,
        prevalence: 3,
        regulatoryUrgency: 5,
        evidenceConfidence: 5,
      },
      opportunity: {
        capabilityMatch: 4,
        installedBaseAdjacency: 4,
        maturityGap: 4,
        engagementTiming: 5,
        proofAsset: 4,
      },
    },
    status: "published",
    lastReviewedOn: LAST_REVIEWED_ON,
  }),
  defineTrend({
    id: "trend-my-fraud-dominance",
    slug: "malaysia-fraud-dominance",
    country: "MY",
    title: "Fraud dominates reported cyber incidents",
    summary:
      "Fraud represented most Cyber999 reports in 2025, placing identity assurance, user protection and risky access detection at the centre of customer conversations.",
    category: "Identity and fraud",
    direction: "rising",
    sectors: ["financial-services", "critical-infrastructure", "manufacturing-ot"],
    observationPeriod: {
      label: "Calendar year 2025",
      start: "2025-01-01",
      end: "2025-12-31",
    },
    sourceIds: ["src-my-cyber999-fraud-2025"],
    customerImpact: [
      "Stolen or socially engineered credentials can turn a fraud event into broader enterprise access.",
      "High report volume can overwhelm manual triage and obscure the accounts that need immediate action.",
      "Customer-facing access controls must balance stronger assurance with acceptable user experience.",
    ],
    discoveryQuestions: [
      "Which high-risk transactions or access journeys still rely on reusable credentials?",
      "Can you identify risky identities before a confirmed fraud loss occurs?",
      "How do identity, fraud and security operations teams share signals and response actions?",
    ],
    workshop: {
      name: "Identity and fraud control discovery",
      format: "discovery",
      duration: "60 minutes",
      objective: "Connect fraud scenarios to workforce, privileged and customer identity control gaps.",
      outputs: ["Priority identity journeys", "Signal-sharing gaps", "Control validation plan"],
    },
    scoreInputs: {
      threat: {
        impact: 5,
        momentum: 5,
        prevalence: 5,
        regulatoryUrgency: 3,
        evidenceConfidence: 5,
      },
      opportunity: {
        capabilityMatch: 5,
        installedBaseAdjacency: 4,
        maturityGap: 5,
        engagementTiming: 4,
        proofAsset: 5,
      },
    },
    status: "published",
    lastReviewedOn: LAST_REVIEWED_ON,
  }),
  defineTrend({
    id: "trend-my-intrusion-persistence",
    slug: "malaysia-intrusion-persistence",
    country: "MY",
    title: "Intrusion reports remain an operational concern",
    summary:
      "Reported intrusions show an ongoing need to connect exposure prioritisation with cross-domain detection and decisive containment.",
    category: "Advanced threats",
    direction: "persistent",
    sectors: ["financial-services", "critical-infrastructure", "manufacturing-ot"],
    observationPeriod: {
      label: "Calendar year 2025",
      start: "2025-01-01",
      end: "2025-12-31",
    },
    sourceIds: ["src-my-cyber999-intrusion-2025"],
    customerImpact: [
      "Unprioritised vulnerabilities can leave exploitable paths open despite high remediation activity.",
      "Separate alert queues slow the investigation of activity spanning endpoint, identity and network domains.",
      "Delayed containment increases operational and regulatory consequences.",
    ],
    discoveryQuestions: [
      "Which exposure signals influence remediation priority beyond technical severity?",
      "How many tools must an analyst open to investigate a multi-domain intrusion?",
      "Which response actions are automated, and which still depend on manual coordination?",
    ],
    workshop: {
      name: "Intrusion detection workflow assessment",
      format: "assessment",
      duration: "90 minutes",
      objective: "Trace the path from exploitable exposure through detection, investigation and containment.",
      outputs: ["Detection workflow map", "Telemetry gaps", "Response automation candidates"],
    },
    scoreInputs: {
      threat: {
        impact: 4,
        momentum: 4,
        prevalence: 4,
        regulatoryUrgency: 3,
        evidenceConfidence: 5,
      },
      opportunity: {
        capabilityMatch: 5,
        installedBaseAdjacency: 4,
        maturityGap: 4,
        engagementTiming: 4,
        proofAsset: 5,
      },
    },
    status: "published",
    lastReviewedOn: LAST_REVIEWED_ON,
  }),
  defineTrend({
    id: "trend-my-ncii-incident-notification",
    slug: "malaysia-ncii-incident-notification",
    country: "MY",
    title: "NCII incident notification demands rapid scoping",
    summary:
      "Act 854 notification duties make fast detection, evidence collection and escalation a practical operating requirement for NCII entities.",
    category: "Regulation",
    direction: "regulatory",
    sectors: ["financial-services", "critical-infrastructure", "manufacturing-ot"],
    observationPeriod: {
      label: "In force from 26 August 2024",
      start: "2024-08-26",
    },
    sourceIds: ["src-my-act854-notification"],
    customerImpact: [
      "Teams need a shared definition of awareness and a reliable path to immediate escalation.",
      "Prescribed incident particulars require accessible, time-aligned telemetry.",
      "A reporting clock can expose delays between operations, security, legal and leadership teams.",
    ],
    regulatoryNote:
      "Confirm entity-specific notification duties and prescribed particulars with NACSA guidance and qualified legal counsel.",
    discoveryQuestions: [
      "What event starts your NCII incident notification process?",
      "Can responders assemble the required incident particulars from retained telemetry within six hours?",
      "Who can approve an external notification when senior leaders are unavailable?",
    ],
    workshop: {
      name: "NCII notification readiness tabletop",
      format: "tabletop",
      duration: "90 minutes",
      objective: "Test incident awareness, evidence assembly and reporting decisions against the notification timeline.",
      outputs: ["Notification decision tree", "Evidence availability gaps", "Escalation action list"],
    },
    scoreInputs: {
      threat: {
        impact: 4,
        momentum: 4,
        prevalence: 3,
        regulatoryUrgency: 5,
        evidenceConfidence: 5,
      },
      opportunity: {
        capabilityMatch: 5,
        installedBaseAdjacency: 4,
        maturityGap: 4,
        engagementTiming: 5,
        proofAsset: 5,
      },
    },
    status: "published",
    lastReviewedOn: LAST_REVIEWED_ON,
  }),
  defineTrend({
    id: "trend-my-ncii-assessment-audit",
    slug: "malaysia-ncii-assessment-audit",
    country: "MY",
    title: "Recurring assessment and audit require measurable control evidence",
    summary:
      "Annual risk assessment and biennial audit duties raise the value of continuous exposure data, governed policy and retained evidence.",
    category: "Regulation",
    direction: "regulatory",
    sectors: ["financial-services", "critical-infrastructure", "manufacturing-ot"],
    observationPeriod: {
      label: "Requirements applicable from 26 August 2024",
      start: "2024-08-26",
    },
    sourceIds: ["src-my-act854-assessment-audit"],
    customerImpact: [
      "Point-in-time evidence gathering creates expensive audit preparation cycles.",
      "Risk registers lose value when they are disconnected from current exposure and control telemetry.",
      "Distributed policy administration can make control consistency difficult to demonstrate.",
    ],
    regulatoryNote:
      "Security platforms can produce useful evidence, but the organisation remains responsible for its risk assessment and audit obligations.",
    discoveryQuestions: [
      "Which technical evidence is still collected manually for risk assessments and audits?",
      "How often does exposure data update the enterprise risk register?",
      "Can you demonstrate policy consistency across firewall and cloud environments?",
    ],
    workshop: {
      name: "Continuous evidence architecture review",
      format: "architecture",
      duration: "90 minutes",
      objective: "Map recurring evidence needs to exposure, policy and security analytics sources.",
      outputs: ["Evidence source matrix", "Manual collection gaps", "Continuous assurance roadmap"],
    },
    scoreInputs: {
      threat: {
        impact: 3,
        momentum: 4,
        prevalence: 4,
        regulatoryUrgency: 5,
        evidenceConfidence: 5,
      },
      opportunity: {
        capabilityMatch: 5,
        installedBaseAdjacency: 4,
        maturityGap: 5,
        engagementTiming: 5,
        proofAsset: 4,
      },
    },
    status: "published",
    lastReviewedOn: LAST_REVIEWED_ON,
  }),
  defineTrend({
    id: "trend-my-eleven-ncii-sectors",
    slug: "malaysia-eleven-ncii-sectors",
    country: "MY",
    title: "Eleven NCII sectors need consistent security governance",
    summary:
      "The breadth of Malaysia's NCII framework makes unified visibility and governed enforcement important across IT, cloud and operational environments.",
    category: "Critical infrastructure",
    direction: "regulatory",
    sectors: ["financial-services", "critical-infrastructure", "manufacturing-ot"],
    observationPeriod: {
      label: "Current NCII sector framework reviewed July 2026",
      end: LAST_REVIEWED_ON,
    },
    sourceIds: ["src-my-ncii-sectors"],
    customerImpact: [
      "Common governance goals must accommodate different sector technologies and operational constraints.",
      "Policy drift grows when controls are administered through disconnected management planes.",
      "Boards need consistent measures of risk and readiness across diverse business units.",
    ],
    regulatoryNote:
      "Sector designation and applicable duties should be confirmed with the responsible NCII sector lead and NACSA guidance.",
    discoveryQuestions: [
      "Which business services and dependencies fall within your NCII scope?",
      "Where do security policies diverge across IT, cloud and operational environments?",
      "What common evidence can leadership use to compare readiness across business units?",
    ],
    workshop: {
      name: "NCII security governance architecture session",
      format: "architecture",
      duration: "120 minutes",
      objective: "Create a common control and evidence model across regulated environments.",
      outputs: ["NCII dependency map", "Policy governance model", "Phased control roadmap"],
    },
    scoreInputs: {
      threat: {
        impact: 5,
        momentum: 4,
        prevalence: 4,
        regulatoryUrgency: 5,
        evidenceConfidence: 5,
      },
      opportunity: {
        capabilityMatch: 5,
        installedBaseAdjacency: 5,
        maturityGap: 4,
        engagementTiming: 4,
        proofAsset: 4,
      },
    },
    status: "published",
    lastReviewedOn: LAST_REVIEWED_ON,
  }),
  defineTrend({
    id: "trend-id-phishing-scale",
    slug: "indonesia-phishing-scale",
    country: "ID",
    title: "Phishing activity creates identity risk at national scale",
    summary:
      "High detected phishing activity reinforces the need for phishing-resistant authentication, identity risk analytics and context-aware access.",
    category: "Identity and fraud",
    direction: "persistent",
    sectors: ["financial-services", "critical-infrastructure", "manufacturing-ot"],
    observationPeriod: {
      label: "Calendar year 2024",
      start: "2024-01-01",
      end: "2024-12-31",
    },
    sourceIds: ["src-id-bssn-phishing-2024"],
    customerImpact: [
      "Large and distributed user populations increase the number of identities and devices that require consistent assurance.",
      "A compromised account can bypass controls that focus only on malicious files or network indicators.",
      "Security teams need to separate risky identity behaviour from normal regional access patterns.",
    ],
    discoveryQuestions: [
      "Which user groups still use phishable authentication for high-value applications?",
      "Can your team detect impossible travel, dormant-account use and unusual privilege changes in one view?",
      "How do access policies respond when user or device risk changes during a session?",
    ],
    workshop: {
      name: "Phishing-resistant access assessment",
      format: "assessment",
      duration: "60 minutes",
      objective: "Prioritise identity journeys for stronger authentication and continuous access decisions.",
      outputs: ["High-risk journey inventory", "Identity signal gaps", "Access modernisation sequence"],
    },
    scoreInputs: {
      threat: {
        impact: 4,
        momentum: 5,
        prevalence: 5,
        regulatoryUrgency: 3,
        evidenceConfidence: 5,
      },
      opportunity: {
        capabilityMatch: 5,
        installedBaseAdjacency: 4,
        maturityGap: 5,
        engagementTiming: 4,
        proofAsset: 5,
      },
    },
    status: "published",
    lastReviewedOn: LAST_REVIEWED_ON,
  }),
  defineTrend({
    id: "trend-id-ransomware-activity",
    slug: "indonesia-ransomware-activity",
    country: "ID",
    title: "Ransomware activity signals sustained disruption risk",
    summary:
      "BSSN activity telemetry and the wider incident environment support continued investment in exposure reduction, cross-domain detection and exercised recovery.",
    category: "Ransomware",
    direction: "persistent",
    sectors: ["financial-services", "critical-infrastructure", "manufacturing-ot"],
    observationPeriod: {
      label: "Calendar year 2024",
      start: "2024-01-01",
      end: "2024-12-31",
    },
    sourceIds: ["src-id-bssn-ransomware-2024"],
    customerImpact: [
      "Geographically distributed operations can complicate asset visibility and coordinated containment.",
      "Activity telemetry needs business context before it can guide response priority.",
      "Recovery plans must account for identity, network and application dependencies.",
    ],
    discoveryQuestions: [
      "Which critical business services lack a tested ransomware recovery sequence?",
      "How is external threat activity connected to your internal exposure and detection priorities?",
      "Can analysts coordinate containment across endpoint, identity and network controls?",
    ],
    workshop: {
      name: "Ransomware control-path workshop",
      format: "tabletop",
      duration: "90 minutes",
      objective: "Validate prevention, detection, containment and recovery paths for a distributed ransomware event.",
      outputs: ["Critical service dependency map", "Containment gaps", "Recovery exercise actions"],
    },
    scoreInputs: {
      threat: {
        impact: 5,
        momentum: 5,
        prevalence: 5,
        regulatoryUrgency: 4,
        evidenceConfidence: 5,
      },
      opportunity: {
        capabilityMatch: 5,
        installedBaseAdjacency: 4,
        maturityGap: 4,
        engagementTiming: 4,
        proofAsset: 5,
      },
    },
    status: "published",
    lastReviewedOn: LAST_REVIEWED_ON,
  }),
  defineTrend({
    id: "trend-id-pdns2-resilience",
    slug: "indonesia-pdns2-resilience",
    country: "ID",
    title: "PDNS 2 recovery highlights public-service resilience",
    summary:
      "The PDNS 2 recovery experience demonstrates why critical digital services need dependency visibility, coordinated response and validated restoration priorities.",
    category: "Operational resilience",
    direction: "evolving",
    sectors: ["critical-infrastructure"],
    observationPeriod: {
      label: "Recovery status reported 9 July 2024",
      end: "2024-07-09",
    },
    sourceIds: ["src-id-pdns2-recovery-2024"],
    customerImpact: [
      "Shared infrastructure incidents can interrupt many public services through common dependencies.",
      "Restoration priority requires an agreed view of service criticality before an incident.",
      "Response teams need telemetry that survives or remains accessible during platform disruption.",
    ],
    discoveryQuestions: [
      "Which services depend on shared identity, network, platform or data components?",
      "Is restoration order agreed between business owners and technical responders?",
      "What detection and investigation evidence remains available if the primary platform is unavailable?",
    ],
    workshop: {
      name: "Critical service resilience tabletop",
      format: "tabletop",
      duration: "120 minutes",
      objective: "Exercise cross-service impact analysis, containment and restoration prioritisation.",
      outputs: ["Service dependency map", "Restoration priority matrix", "Resilience improvement backlog"],
    },
    scoreInputs: {
      threat: {
        impact: 5,
        momentum: 4,
        prevalence: 4,
        regulatoryUrgency: 5,
        evidenceConfidence: 5,
      },
      opportunity: {
        capabilityMatch: 5,
        installedBaseAdjacency: 4,
        maturityGap: 5,
        engagementTiming: 5,
        proofAsset: 5,
      },
    },
    status: "published",
    lastReviewedOn: LAST_REVIEWED_ON,
  }),
  defineTrend({
    id: "trend-id-pdp-accountability",
    slug: "indonesia-pdp-accountability",
    country: "ID",
    title: "PDP accountability increases the value of access and data visibility",
    summary:
      "The end of the PDP Law transition period raises expectations for governed access, defensible breach investigation and consistent data protection controls.",
    category: "Regulation",
    direction: "regulatory",
    sectors: ["financial-services", "critical-infrastructure", "manufacturing-ot"],
    observationPeriod: {
      label: "Two-year transition ended 17 October 2024",
      start: "2022-10-17",
      end: "2024-10-17",
    },
    sourceIds: ["src-id-pdp-law-transition"],
    customerImpact: [
      "Organisations need to understand who can access sensitive data across cloud and private applications.",
      "Breach assessment depends on joined identity, access, network and application evidence.",
      "Policy consistency becomes difficult when access and data controls are managed separately.",
    ],
    regulatoryNote:
      "Cisco capabilities can support security controls and evidence collection, but legal teams must interpret PDP obligations for the organisation.",
    discoveryQuestions: [
      "Can you identify sensitive-data access paths across sanctioned and unsanctioned cloud applications?",
      "How quickly can investigators determine which identities and data were involved in an event?",
      "Where do access policies differ between private applications, SaaS and internet use?",
    ],
    workshop: {
      name: "Data access and investigation readiness review",
      format: "architecture",
      duration: "90 minutes",
      objective: "Map sensitive-data access paths and the evidence needed for breach assessment.",
      outputs: ["Access-path inventory", "Investigation evidence map", "Policy consolidation priorities"],
    },
    scoreInputs: {
      threat: {
        impact: 4,
        momentum: 4,
        prevalence: 5,
        regulatoryUrgency: 5,
        evidenceConfidence: 5,
      },
      opportunity: {
        capabilityMatch: 5,
        installedBaseAdjacency: 4,
        maturityGap: 4,
        engagementTiming: 5,
        proofAsset: 4,
      },
    },
    status: "published",
    lastReviewedOn: LAST_REVIEWED_ON,
  }),
  defineTrend({
    id: "trend-id-vital-infrastructure",
    slug: "indonesia-vital-infrastructure",
    country: "ID",
    title: "Vital infrastructure protection needs operational context",
    summary:
      "The national vital information infrastructure framework creates a strong case for asset visibility, safe segmentation and coordinated detection across IT and operational technology.",
    category: "Critical infrastructure",
    direction: "regulatory",
    sectors: ["critical-infrastructure", "manufacturing-ot"],
    observationPeriod: {
      label: "In force from 19 September 2022",
      start: "2022-09-19",
    },
    sourceIds: ["src-id-vital-information-infrastructure"],
    customerImpact: [
      "Unknown industrial assets and communications paths make risk difficult to assess.",
      "Generic IT controls can disrupt sensitive operational processes if applied without context.",
      "Incident response must coordinate security, engineering, operations and government stakeholders.",
    ],
    regulatoryNote:
      "Technical controls support resilience objectives but do not determine designation or satisfy the full legal framework on their own.",
    discoveryQuestions: [
      "Can you continuously identify industrial assets, protocols and communications without disrupting production?",
      "Which operational zones lack enforceable segmentation or monitored remote access?",
      "How do security and engineering teams share incident context and response authority?",
    ],
    workshop: {
      name: "Industrial visibility and segmentation assessment",
      format: "assessment",
      duration: "120 minutes",
      objective: "Establish operational asset visibility and prioritise safe segmentation use cases.",
      outputs: ["Industrial asset visibility gaps", "Zone and conduit map", "Phased protection roadmap"],
    },
    scoreInputs: {
      threat: {
        impact: 5,
        momentum: 4,
        prevalence: 4,
        regulatoryUrgency: 5,
        evidenceConfidence: 5,
      },
      opportunity: {
        capabilityMatch: 5,
        installedBaseAdjacency: 4,
        maturityGap: 5,
        engagementTiming: 4,
        proofAsset: 5,
      },
    },
    status: "published",
    lastReviewedOn: LAST_REVIEWED_ON,
  }),
];

export const trendProductMappings: readonly TrendProductMapping[] = [
  {
    trendId: "trend-sg-ransomware-persistence",
    primaryProductId: "product-xdr",
    supportingProductIds: ["product-splunk-es", "product-vulnerability-management"],
    controlOutcome: "Reduce ransomware dwell time and coordinate evidence-led containment.",
    positioning:
      "Lead with a unified investigation and response workflow, then connect security analytics and risk-based exposure prioritisation.",
    disclaimer: POSITIONING_DISCLAIMER,
  },
  {
    trendId: "trend-sg-infected-system-growth",
    primaryProductId: "product-hybrid-mesh-firewall",
    supportingProductIds: ["product-vulnerability-management", "product-security-cloud-control"],
    controlOutcome: "Find high-risk exposure and apply consistent distributed enforcement.",
    positioning:
      "Connect prioritised exposure context to segmentation and governed policy across hybrid environments.",
    disclaimer: POSITIONING_DISCLAIMER,
  },
  {
    trendId: "trend-sg-phishing-sophistication",
    primaryProductId: "product-duo",
    supportingProductIds: ["product-identity-intelligence", "product-secure-access"],
    controlOutcome: "Make stolen credentials less useful through stronger, context-aware access.",
    positioning:
      "Start with phishing-resistant authentication, then add identity risk context and continuous access enforcement.",
    disclaimer: POSITIONING_DISCLAIMER,
  },
  {
    trendId: "trend-sg-apt-telecommunications",
    primaryProductId: "product-hybrid-mesh-firewall",
    supportingProductIds: ["product-xdr", "product-security-cloud-control"],
    controlOutcome: "Limit advanced-threat movement while preserving critical service availability.",
    positioning:
      "Use distributed segmentation as the containment foundation, supported by cross-domain detection and governed policy.",
    disclaimer: POSITIONING_DISCLAIMER,
  },
  {
    trendId: "trend-sg-cii-reporting-scope",
    primaryProductId: "product-xdr",
    supportingProductIds: ["product-splunk-es", "product-security-cloud-control"],
    controlOutcome: "Produce timely, defensible investigation evidence and response decisions.",
    positioning:
      "Connect response workflows to retained analytics and consistent control evidence for reporting readiness.",
    disclaimer: POSITIONING_DISCLAIMER,
  },
  {
    trendId: "trend-my-fraud-dominance",
    primaryProductId: "product-duo",
    supportingProductIds: ["product-identity-intelligence", "product-secure-access"],
    controlOutcome: "Reduce identity-led fraud and detect risky access earlier.",
    positioning:
      "Strengthen authentication first, then use identity and access context to identify and constrain risky behaviour.",
    disclaimer: POSITIONING_DISCLAIMER,
  },
  {
    trendId: "trend-my-intrusion-persistence",
    primaryProductId: "product-xdr",
    supportingProductIds: ["product-splunk-es", "product-vulnerability-management"],
    controlOutcome: "Prioritise exploitable paths and shorten intrusion investigation time.",
    positioning:
      "Connect risk-based remediation with cross-domain detection and security analytics instead of adding another isolated alert queue.",
    disclaimer: POSITIONING_DISCLAIMER,
  },
  {
    trendId: "trend-my-ncii-incident-notification",
    primaryProductId: "product-xdr",
    supportingProductIds: ["product-splunk-es", "product-security-cloud-control"],
    controlOutcome: "Scope incidents quickly and preserve the evidence needed for escalation.",
    positioning:
      "Use a joined response workflow and retained analytics to support the organisation's notification process.",
    disclaimer: POSITIONING_DISCLAIMER,
  },
  {
    trendId: "trend-my-ncii-assessment-audit",
    primaryProductId: "product-vulnerability-management",
    supportingProductIds: ["product-security-cloud-control", "product-splunk-es"],
    controlOutcome: "Turn current risk and policy telemetry into repeatable assurance evidence.",
    positioning:
      "Begin with risk-based exposure decisions and connect governed security policy with retained analytics.",
    disclaimer: POSITIONING_DISCLAIMER,
  },
  {
    trendId: "trend-my-eleven-ncii-sectors",
    primaryProductId: "product-security-cloud-control",
    supportingProductIds: ["product-hybrid-mesh-firewall", "product-cyber-vision"],
    controlOutcome: "Govern security policy consistently across hybrid and operational environments.",
    positioning:
      "Lead with common policy governance, then apply distributed enforcement and operational asset context where needed.",
    disclaimer: POSITIONING_DISCLAIMER,
  },
  {
    trendId: "trend-id-phishing-scale",
    primaryProductId: "product-duo",
    supportingProductIds: ["product-identity-intelligence", "product-secure-access"],
    controlOutcome: "Protect distributed users with phishing-resistant, risk-aware access.",
    positioning:
      "Modernise high-risk authentication journeys and use identity and device context for continuous access decisions.",
    disclaimer: POSITIONING_DISCLAIMER,
  },
  {
    trendId: "trend-id-ransomware-activity",
    primaryProductId: "product-xdr",
    supportingProductIds: ["product-splunk-es", "product-vulnerability-management"],
    controlOutcome: "Translate activity and exposure signals into faster ransomware decisions.",
    positioning:
      "Correlate cross-domain evidence for response while prioritising the exposures most likely to create material risk.",
    disclaimer: POSITIONING_DISCLAIMER,
  },
  {
    trendId: "trend-id-pdns2-resilience",
    primaryProductId: "product-xdr",
    supportingProductIds: ["product-hybrid-mesh-firewall", "product-splunk-es"],
    controlOutcome: "Coordinate detection and containment around critical service dependencies.",
    positioning:
      "Use a joined response view, enforceable segmentation and retained analytics to improve service resilience exercises.",
    disclaimer: POSITIONING_DISCLAIMER,
  },
  {
    trendId: "trend-id-pdp-accountability",
    primaryProductId: "product-secure-access",
    supportingProductIds: ["product-duo", "product-security-cloud-control"],
    controlOutcome: "Govern access to applications and data with stronger identity context.",
    positioning:
      "Apply consistent access controls across private, SaaS and internet use, supported by stronger identity assurance and policy governance.",
    disclaimer: POSITIONING_DISCLAIMER,
  },
  {
    trendId: "trend-id-vital-infrastructure",
    primaryProductId: "product-cyber-vision",
    supportingProductIds: ["product-industrial-threat-defense", "product-secure-firewall"],
    controlOutcome: "Gain operational visibility and enforce safe industrial segmentation.",
    positioning:
      "Start with passive industrial context, then design segmentation and threat controls around operational safety requirements.",
    disclaimer: POSITIONING_DISCLAIMER,
  },
];

function matchesIdOrSlug(
  item: { id: string; slug: string },
  idOrSlug: string,
): boolean {
  const candidate = idOrSlug.trim().toLowerCase();
  return item.id.toLowerCase() === candidate || item.slug.toLowerCase() === candidate;
}

function roundedAverage(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((total, value) => total + value, 0) / values.length);
}

export function getCountry(codeOrSlug: CountryCode | string): Country | undefined {
  const candidate = codeOrSlug.trim().toLowerCase();
  return countries.find(
    (country) =>
      country.code.toLowerCase() === candidate || country.slug.toLowerCase() === candidate,
  );
}

export function getCountryTrends(codeOrSlug: CountryCode | string): readonly Trend[] {
  const country = getCountry(codeOrSlug);
  if (!country) return [];
  return trends.filter((trend) => trend.country === country.code);
}

export function getTrend(idOrSlug: string): Trend | undefined {
  return trends.find((trend) => matchesIdOrSlug(trend, idOrSlug));
}

export function getSource(idOrSlug: string): EvidenceSource | undefined {
  return sources.find((source) => matchesIdOrSlug(source, idOrSlug));
}

export function getProduct(idOrSlug: string): CiscoProduct | undefined {
  return products.find((product) => matchesIdOrSlug(product, idOrSlug));
}

export function getTrendSources(trendIdOrSlug: string): readonly EvidenceSource[] {
  const trend = getTrend(trendIdOrSlug);
  if (!trend) return [];
  return trend.sourceIds.flatMap((sourceId) => {
    const source = getSource(sourceId);
    return source ? [source] : [];
  });
}

export function getTrendProducts(
  trendIdOrSlug: string,
): ResolvedTrendProducts | undefined {
  const trend = getTrend(trendIdOrSlug);
  if (!trend) return undefined;

  const mapping = trendProductMappings.find((item) => item.trendId === trend.id);
  if (!mapping) return undefined;

  const primary = getProduct(mapping.primaryProductId);
  if (!primary) return undefined;

  const supporting = mapping.supportingProductIds.flatMap((productId) => {
    const product = getProduct(productId);
    return product ? [product] : [];
  });

  return { mapping, primary, supporting };
}

export function getTopTrends(limit = 5, countryCode?: CountryCode): readonly Trend[] {
  const pool = countryCode ? getCountryTrends(countryCode) : trends;
  return [...pool]
    .sort(
      (left, right) =>
        right.threatPriority - left.threatPriority ||
        right.opportunityFit - left.opportunityFit ||
        left.title.localeCompare(right.title),
    )
    .slice(0, Math.max(0, limit));
}

export function getRegionalStats(): RegionalStats {
  const countryStats = countries.map((country) => {
    const countryTrends = getCountryTrends(country.code);
    const topTrend = getTopTrends(1, country.code)[0];

    if (!topTrend) {
      throw new Error(`Seed data is missing published trends for ${country.name}.`);
    }

    return {
      country,
      trendCount: countryTrends.length,
      averageThreatPriority: roundedAverage(
        countryTrends.map((trend) => trend.threatPriority),
      ),
      averageOpportunityFit: roundedAverage(
        countryTrends.map((trend) => trend.opportunityFit),
      ),
      topTrend,
    };
  });

  return {
    countryCount: countries.length,
    trendCount: trends.length,
    sourceCount: sources.length,
    productCount: products.length,
    highPriorityCount: trends.filter((trend) => trend.threatPriority >= 70).length,
    averageThreatPriority: roundedAverage(trends.map((trend) => trend.threatPriority)),
    averageOpportunityFit: roundedAverage(trends.map((trend) => trend.opportunityFit)),
    lastReviewedOn: trends.reduce(
      (latest, trend) => (trend.lastReviewedOn > latest ? trend.lastReviewedOn : latest),
      "",
    ),
    countries: countryStats,
  };
}

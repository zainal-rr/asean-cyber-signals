import {
  Document,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import type { BriefOutput } from "@/lib/briefs/schema";

const colors = {
  ink: "#0F172A",
  muted: "#475569",
  soft: "#E2E8F0",
  surface: "#F7F9FB",
  accent: "#006B8F",
  accentSoft: "#E7F4F8",
  amber: "#9A6700",
  amberSoft: "#FFF7D6",
};

const styles = StyleSheet.create({
  page: {
    position: "relative",
    paddingTop: 28,
    paddingRight: 30,
    paddingBottom: 42,
    paddingLeft: 30,
    backgroundColor: "#FFFFFF",
    color: colors.ink,
    fontFamily: "Helvetica",
    fontSize: 8,
    lineHeight: 1.32,
  },
  watermark: {
    position: "absolute",
    top: 375,
    left: 85,
    color: "#CBD5E1",
    fontSize: 34,
    fontFamily: "Helvetica-Bold",
    opacity: 0.2,
    transform: "rotate(-33deg)",
    letterSpacing: 2,
  },
  eyebrow: {
    color: colors.accent,
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    letterSpacing: 1.1,
    marginBottom: 5,
    textTransform: "uppercase",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomColor: colors.ink,
    borderBottomWidth: 1.2,
  },
  headerCopy: { width: "73%" },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 20,
    lineHeight: 1.05,
    marginBottom: 7,
  },
  subtitle: { color: colors.muted, fontSize: 8.2 },
  status: {
    maxWidth: "24%",
    borderRadius: 3,
    paddingVertical: 5,
    paddingHorizontal: 7,
    backgroundColor: colors.amberSoft,
    color: colors.amber,
    fontFamily: "Helvetica-Bold",
    fontSize: 6.8,
    textAlign: "center",
  },
  reviewedStatus: {
    backgroundColor: colors.accentSoft,
    color: colors.accent,
  },
  metaRow: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 12,
    paddingVertical: 7,
    paddingHorizontal: 9,
    backgroundColor: colors.surface,
  },
  metaItem: { width: "25%", paddingRight: 8 },
  metaLabel: {
    color: colors.muted,
    fontFamily: "Helvetica-Bold",
    fontSize: 5.8,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 2,
  },
  metaValue: { fontFamily: "Helvetica-Bold", fontSize: 7.2 },
  summary: {
    paddingBottom: 12,
    borderBottomColor: colors.soft,
    borderBottomWidth: 0.8,
  },
  sectionLabel: {
    color: colors.accent,
    fontFamily: "Helvetica-Bold",
    fontSize: 6.2,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  summaryText: { fontSize: 9.3, lineHeight: 1.38 },
  columns: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
  },
  mainColumn: { width: "64%", paddingRight: 13 },
  sideColumn: {
    width: "36%",
    paddingLeft: 12,
    borderLeftColor: colors.soft,
    borderLeftWidth: 0.8,
  },
  priority: {
    marginBottom: 10,
    paddingBottom: 9,
    borderBottomColor: colors.soft,
    borderBottomWidth: 0.6,
  },
  priorityHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 4 },
  priorityIndex: {
    width: 17,
    height: 17,
    borderRadius: 8.5,
    paddingTop: 4.2,
    marginRight: 6,
    backgroundColor: colors.ink,
    color: "#FFFFFF",
    fontFamily: "Helvetica-Bold",
    fontSize: 6.2,
    textAlign: "center",
  },
  priorityTitle: {
    width: "90%",
    fontFamily: "Helvetica-Bold",
    fontSize: 9.2,
    lineHeight: 1.2,
  },
  narrative: { color: colors.muted, marginBottom: 5.5, fontSize: 7.4 },
  play: {
    paddingVertical: 5.5,
    paddingHorizontal: 7,
    borderRadius: 3,
    backgroundColor: colors.accentSoft,
  },
  playLabel: {
    color: colors.accent,
    fontFamily: "Helvetica-Bold",
    fontSize: 5.7,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  playText: { fontSize: 6.9, marginBottom: 2 },
  productText: { color: colors.accent, fontFamily: "Helvetica-Bold", fontSize: 6.8 },
  workshop: { color: colors.muted, fontSize: 6.2, marginTop: 4 },
  compactSection: { marginBottom: 12 },
  bulletRow: { flexDirection: "row", marginBottom: 5 },
  bullet: { width: 8, color: colors.accent, fontFamily: "Helvetica-Bold" },
  bulletText: { width: "94%", color: colors.ink, fontSize: 6.8 },
  citation: { marginBottom: 5 },
  citationNumber: { color: colors.muted, fontFamily: "Helvetica-Bold", fontSize: 5.6 },
  citationLink: { color: colors.accent, fontSize: 6.1, textDecoration: "none" },
  citationMeta: { color: colors.muted, fontSize: 5.5, marginTop: 1 },
  caveat: { color: colors.muted, fontSize: 5.7, marginBottom: 3 },
  overflowNote: { color: colors.muted, fontSize: 5.6, fontStyle: "italic", marginTop: 3 },
  footer: {
    marginTop: 11,
    paddingTop: 6,
    borderTopColor: colors.soft,
    borderTopWidth: 0.7,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  disclaimer: { width: "86%", color: colors.muted, fontSize: 5.5 },
  pageNumber: { width: "10%", color: colors.muted, fontSize: 5.5, textAlign: "right" },
});

function label(value: string) {
  return value
    .split("-")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function short(value: string, maximum = 105) {
  if (value.length <= maximum) return value;
  return `${value.slice(0, maximum - 1).trimEnd()}…`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

export function BriefPdfDocument({ brief }: { brief: BriefOutput }) {
  const visiblePriorities = brief.priorities.slice(0, 3);
  const visibleEvidenceIds = new Set(
    visiblePriorities.flatMap((priority) => priority.evidenceIds),
  );
  const visibleCitations = brief.citations.filter((citation) =>
    visibleEvidenceIds.has(citation.evidenceId),
  );
  const discoveryQuestions = visiblePriorities
    .flatMap((priority) => priority.discoveryQuestions.slice(0, 1))
    .slice(0, 3);

  return (
    <Document
      title={brief.title}
      author="ASEAN Cyber Signals"
      subject="Citation-backed cybersecurity presales brief"
      keywords="cybersecurity, ASEAN, presales, public evidence"
    >
      <Page size="A4" style={styles.page}>
        {!brief.reviewedForSharing ? (
          <Text style={styles.watermark}>DRAFT - VALIDATE BEFORE SHARING</Text>
        ) : null}

        <View style={styles.headerRow}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>ASEAN Cyber Signals</Text>
            <Text style={styles.title}>{brief.title}</Text>
            <Text style={styles.subtitle}>
              Reviewed public evidence translated into security outcomes and customer discovery.
            </Text>
          </View>
          <Text
            style={[
              styles.status,
              ...(brief.reviewedForSharing ? [styles.reviewedStatus] : []),
            ]}
          >
            {brief.reviewedForSharing
              ? "REVIEWED FOR SHARING"
              : "AI-ASSISTED DRAFT\nVALIDATE BEFORE CUSTOMER USE"}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Market</Text>
            <Text style={styles.metaValue}>{brief.countryName}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Sector</Text>
            <Text style={styles.metaValue}>{label(brief.sector)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Maturity</Text>
            <Text style={styles.metaValue}>{label(brief.maturity)}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>Generated</Text>
            <Text style={styles.metaValue}>{formatDate(brief.generatedAt)}</Text>
          </View>
        </View>

        <View style={styles.summary}>
          <Text style={styles.sectionLabel}>Executive summary</Text>
          <Text style={styles.summaryText}>{short(brief.executiveSummary, 680)}</Text>
        </View>

        <View style={styles.columns}>
          <View style={styles.mainColumn}>
            <Text style={styles.sectionLabel}>Priority outcome plays</Text>
            {visiblePriorities.map((priority, index) => (
              <View key={priority.trendId} style={styles.priority}>
                <View style={styles.priorityHeader}>
                  <Text style={styles.priorityIndex}>{index + 1}</Text>
                  <Text style={styles.priorityTitle}>{priority.title}</Text>
                </View>
                <Text style={styles.narrative}>{short(priority.narrative, 380)}</Text>
                <View style={styles.play}>
                  <Text style={styles.playLabel}>Desired security outcome</Text>
                  <Text style={styles.playText}>
                    {short(priority.outcomePlay.desiredOutcome, 180)}
                  </Text>
                  <Text style={styles.productText}>
                    {priority.outcomePlay.primaryProduct.name}
                    {priority.outcomePlay.supportingProducts.length > 0
                      ? ` + ${priority.outcomePlay.supportingProducts
                          .map((product) => product.name)
                          .join(" + ")}`
                      : ""}
                  </Text>
                </View>
                <Text style={styles.workshop}>
                  Workshop: {short(priority.recommendedWorkshop.name, 110)} ({priority.recommendedWorkshop.duration})
                </Text>
              </View>
            ))}
            {brief.priorities.length > visiblePriorities.length ? (
              <Text style={styles.overflowNote}>
                +{brief.priorities.length - visiblePriorities.length} additional approved signal(s) in the interactive brief.
              </Text>
            ) : null}
          </View>

          <View style={styles.sideColumn}>
            <View style={styles.compactSection}>
              <Text style={styles.sectionLabel}>Discovery prompts</Text>
              {discoveryQuestions.map((question) => (
                <View key={question} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{short(question, 170)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.compactSection}>
              <Text style={styles.sectionLabel}>Recommended next steps</Text>
              {brief.nextSteps.slice(0, 3).map((step) => (
                <View key={step} style={styles.bulletRow}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{short(step, 180)}</Text>
                </View>
              ))}
            </View>

            <View style={styles.compactSection}>
              <Text style={styles.sectionLabel}>Evidence</Text>
              {visibleCitations.map((citation, index) => (
                <View key={citation.evidenceId} style={styles.citation}>
                  <Text style={styles.citationNumber}>[{index + 1}] {citation.publisher}</Text>
                  <Link src={citation.url} style={styles.citationLink}>
                    {short(citation.title)}
                  </Link>
                  <Text style={styles.citationMeta}>
                    Observation: {citation.observationPeriod}
                    {citation.publishedOn ? ` · Published ${citation.publishedOn}` : ""}
                  </Text>
                </View>
              ))}
            </View>

            <View>
              <Text style={styles.sectionLabel}>Use with care</Text>
              {brief.caveats.slice(0, 3).map((caveat) => (
                <Text key={caveat} style={styles.caveat}>• {short(caveat, 170)}</Text>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.disclaimer}>{brief.disclaimer}</Text>
          <Text style={styles.pageNumber}>1/1</Text>
        </View>
      </Page>
    </Document>
  );
}

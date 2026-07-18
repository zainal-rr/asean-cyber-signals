import { describe, expect, it } from "vitest";

import { calculateOpportunityFit, calculateThreatPriority } from "./scoring";
import {
  countries,
  getCountry,
  getCountryTrends,
  getProduct,
  getRegionalStats,
  getSource,
  getTopTrends,
  getTrend,
  getTrendProducts,
  getTrendSources,
  products,
  sources,
  trendProductMappings,
  trends,
} from "./seed";

describe("ASEAN Cyber Signals seed data", () => {
  it("contains exactly five published trends for each of three countries", () => {
    expect(countries).toHaveLength(3);
    expect(trends).toHaveLength(15);
    expect(getCountryTrends("SG")).toHaveLength(5);
    expect(getCountryTrends("malaysia")).toHaveLength(5);
    expect(getCountryTrends("ID")).toHaveLength(5);
    expect(trends.every((trend) => trend.status === "published")).toBe(true);
  });

  it("uses unique stable identifiers and slugs", () => {
    for (const collection of [countries, sources, products, trends]) {
      expect(new Set(collection.map((item) => item.id)).size).toBe(collection.length);
      expect(new Set(collection.map((item) => item.slug)).size).toBe(collection.length);
    }
  });

  it("links every trend to approved authoritative evidence for the same country", () => {
    for (const trend of trends) {
      expect(trend.sourceIds.length).toBeGreaterThan(0);
      const evidence = getTrendSources(trend.id);
      expect(evidence).toHaveLength(trend.sourceIds.length);

      for (const source of evidence) {
        expect(source.country).toBe(trend.country);
        expect(source.status).toBe("approved");
        expect(source.url.startsWith("https://")).toBe(true);
        expect(source.observationPeriod.label.length).toBeGreaterThan(0);
        expect(source.claim.length).toBeGreaterThan(40);
      }
    }
  });

  it("retains native titles for Malay and Indonesian evidence", () => {
    const nonEnglishSources = sources.filter((source) => source.language !== "English");
    expect(nonEnglishSources.length).toBeGreaterThan(0);
    expect(nonEnglishSources.every((source) => Boolean(source.nativeTitle))).toBe(true);
  });

  it("keeps activity, detection and affected-entity measures distinct", () => {
    expect(getSource("indonesia-bssn-ransomware-2024")?.metricKind).toBe(
      "ransomware_activities",
    );
    expect(getSource("singapore-infected-systems-2025")?.metricKind).toBe(
      "detected_infrastructure",
    );
    expect(getSource("indonesia-pdns2-service-recovery-2024")?.metricKind).toBe(
      "affected_entities",
    );
  });

  it("has exactly one valid product mapping per trend", () => {
    expect(trendProductMappings).toHaveLength(trends.length);
    expect(new Set(trendProductMappings.map((mapping) => mapping.trendId)).size).toBe(
      trends.length,
    );

    for (const trend of trends) {
      const resolved = getTrendProducts(trend.slug);
      expect(resolved).toBeDefined();
      expect(resolved?.primary.id).toBe(resolved?.mapping.primaryProductId);
      expect(resolved?.supporting).toHaveLength(
        resolved?.mapping.supportingProductIds.length ?? 0,
      );
      expect(resolved?.supporting.length).toBeLessThanOrEqual(2);
      expect(resolved?.mapping.supportingProductIds).not.toContain(
        resolved?.mapping.primaryProductId,
      );
      expect(resolved?.mapping.disclaimer).toContain("do not by themselves guarantee compliance");
    }
  });

  it("keeps product URLs official and product reviews monthly", () => {
    for (const product of products) {
      const hostname = new URL(product.url).hostname;
      expect(["www.cisco.com", "www.splunk.com"]).toContain(hostname);
      expect(product.reviewCadence).toBe("monthly");
    }
  });

  it("stores transparent inputs and their independently calculated scores", () => {
    for (const trend of trends) {
      expect(trend.threatPriority).toBe(calculateThreatPriority(trend.scoreInputs.threat));
      expect(trend.opportunityFit).toBe(
        calculateOpportunityFit(trend.scoreInputs.opportunity),
      );
      expect(trend.threatPriority).toBeGreaterThanOrEqual(0);
      expect(trend.threatPriority).toBeLessThanOrEqual(100);
      expect(trend.opportunityFit).toBeGreaterThanOrEqual(0);
      expect(trend.opportunityFit).toBeLessThanOrEqual(100);
    }
  });

  it("provides actionable discovery and workshop content for every trend", () => {
    for (const trend of trends) {
      expect(trend.customerImpact.length).toBeGreaterThanOrEqual(2);
      expect(trend.discoveryQuestions.length).toBeGreaterThanOrEqual(2);
      expect(trend.workshop.outputs.length).toBeGreaterThanOrEqual(2);
      expect(trend.workshop.objective.length).toBeGreaterThan(20);
    }
  });

  it("supports country, trend, source and product selectors by code, id or slug", () => {
    expect(getCountry("sg")?.name).toBe("Singapore");
    expect(getCountry("malaysia")?.code).toBe("MY");
    expect(getTrend("singapore-ransomware-persistence")?.country).toBe("SG");
    expect(getTrend("trend-id-pdns2-resilience")?.country).toBe("ID");
    expect(getSource("src-my-cyber999-fraud-2025")?.publisher).toBe(
      "CyberSecurity Malaysia",
    );
    expect(getProduct("cisco-xdr")?.id).toBe("product-xdr");
    expect(getCountry("unknown")).toBeUndefined();
    expect(getCountryTrends("unknown")).toEqual([]);
    expect(getTrendProducts("unknown")).toBeUndefined();
  });

  it("returns ranked, internally consistent regional statistics", () => {
    const stats = getRegionalStats();
    expect(stats.countryCount).toBe(3);
    expect(stats.trendCount).toBe(15);
    expect(stats.sourceCount).toBe(sources.length);
    expect(stats.productCount).toBe(products.length);
    expect(stats.countries).toHaveLength(3);
    expect(stats.countries.every((country) => country.trendCount === 5)).toBe(true);

    const top = getTopTrends(5);
    expect(top).toHaveLength(5);
    expect(top[0].threatPriority).toBeGreaterThanOrEqual(top[4].threatPriority);
  });

  it("contains no visible em dash characters", () => {
    expect(JSON.stringify({ countries, sources, products, trends, trendProductMappings })).not.toContain(
      "\u2014",
    );
  });
});

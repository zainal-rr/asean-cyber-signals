import { describe, expect, it } from "vitest";

import {
  assessDiscoveryChange,
  assertPublicDnsAddresses,
  hasExpectedMagicBytes,
  isPublicIpAddress,
  SourceSecurityError,
  validateSourceUrl,
} from "../security";

describe("source URL safety", () => {
  it("allows only HTTPS URLs on an exact host allowlist", () => {
    expect(
      validateSourceUrl("https://www.csa.gov.sg/resources/", [
        "www.csa.gov.sg",
      ]).hostname,
    ).toBe("www.csa.gov.sg");

    expect(() =>
      validateSourceUrl("http://www.csa.gov.sg/resources/", [
        "www.csa.gov.sg",
      ]),
    ).toThrowError(new SourceSecurityError("protocol_not_allowed"));
    expect(() =>
      validateSourceUrl("https://www.csa.gov.sg.evil.test/", [
        "www.csa.gov.sg",
      ]),
    ).toThrowError(new SourceSecurityError("host_not_allowlisted"));
    expect(() =>
      validateSourceUrl("https://user:secret@www.csa.gov.sg/", [
        "www.csa.gov.sg",
      ]),
    ).toThrowError(new SourceSecurityError("credentials_not_allowed"));
  });

  it("rejects private, local, reserved, and mixed DNS answers", () => {
    expect(isPublicIpAddress("8.8.8.8")).toBe(true);
    expect(isPublicIpAddress("2606:4700:4700::1111")).toBe(true);
    expect(isPublicIpAddress("127.0.0.1")).toBe(false);
    expect(isPublicIpAddress("10.2.3.4")).toBe(false);
    expect(isPublicIpAddress("169.254.169.254")).toBe(false);
    expect(isPublicIpAddress("::1")).toBe(false);
    expect(isPublicIpAddress("fd00::1")).toBe(false);
    expect(isPublicIpAddress("::ffff:7f00:1")).toBe(false);
    expect(isPublicIpAddress("fec0::1")).toBe(false);

    expect(() => assertPublicDnsAddresses(["8.8.8.8", "10.0.0.4"]))
      .toThrowError(new SourceSecurityError("non_public_address"));
  });

  it("checks PDF and text document signatures", () => {
    expect(
      hasExpectedMagicBytes(
        "application/pdf",
        new TextEncoder().encode("%PDF-1.7"),
      ),
    ).toBe(true);
    expect(
      hasExpectedMagicBytes(
        "application/pdf",
        new TextEncoder().encode("<html>not a PDF</html>"),
      ),
    ).toBe(false);
    expect(
      hasExpectedMagicBytes(
        "text/html",
        new TextEncoder().encode("<!doctype html><html></html>"),
      ),
    ).toBe(true);
  });
});

describe("discovery quarantine thresholds", () => {
  it("quarantines zero-result and structural count changes", () => {
    expect(assessDiscoveryChange(12, 0)).toEqual({
      quarantine: true,
      reasons: ["zero_results", "item_count_change_over_50_percent"],
      changeRatio: 1,
    });
    expect(assessDiscoveryChange(100, 151).quarantine).toBe(true);
    expect(assessDiscoveryChange(100, 150).quarantine).toBe(false);
  });
});

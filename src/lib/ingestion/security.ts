import { isIP } from "node:net";

import type { DiscoveryAssessment } from "./types";

export class SourceSecurityError extends Error {
  readonly code:
    | "invalid_url"
    | "protocol_not_allowed"
    | "credentials_not_allowed"
    | "port_not_allowed"
    | "host_not_allowlisted"
    | "non_public_address";

  constructor(code: SourceSecurityError["code"]) {
    super(code);
    this.name = "SourceSecurityError";
    this.code = code;
  }
}

function ipv4Octets(address: string) {
  const octets = address.split(".").map(Number);
  return octets.length === 4 && octets.every((value) => value >= 0 && value <= 255)
    ? octets
    : null;
}

function isPublicIpv4(address: string) {
  const octets = ipv4Octets(address);
  if (!octets) return false;

  const [a, b] = octets;
  if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  if (a === 169 && b === 254) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && (b === 0 || b === 168)) return false;
  if (a === 198 && (b === 18 || b === 19)) return false;

  const documentationRange =
    (a === 192 && b === 0 && octets[2] === 2) ||
    (a === 198 && b === 51 && octets[2] === 100) ||
    (a === 203 && b === 0 && octets[2] === 113);
  return !documentationRange;
}

function mappedIpv4(address: string) {
  const match = address.toLowerCase().match(/^(?:::ffff:)(\d+\.\d+\.\d+\.\d+)$/);
  if (match?.[1]) return match[1];

  const hexadecimal = address
    .toLowerCase()
    .match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (!hexadecimal) return null;
  const high = Number.parseInt(hexadecimal[1], 16);
  const low = Number.parseInt(hexadecimal[2], 16);
  return [high >> 8, high & 255, low >> 8, low & 255].join(".");
}

function isPublicIpv6(address: string) {
  const normalized = address.toLowerCase().split("%")[0];
  const mapped = mappedIpv4(normalized);
  if (mapped) return isPublicIpv4(mapped);

  if (normalized === "::" || normalized === "::1") return false;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return false;
  if (/^fe[89a-f]/.test(normalized)) return false;
  if (normalized.startsWith("ff")) return false;
  if (normalized.startsWith("2001:0000:") || normalized.startsWith("2001:0:")) {
    return false;
  }
  if (normalized.startsWith("2001:db8:")) return false;
  if (normalized.startsWith("2002:")) return false;
  return true;
}

export function isPublicIpAddress(address: string) {
  const family = isIP(address);
  if (family === 4) return isPublicIpv4(address);
  if (family === 6) return isPublicIpv6(address);
  return false;
}

export function validateSourceUrl(
  rawUrl: string,
  allowedHosts: readonly string[],
) {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new SourceSecurityError("invalid_url");
  }

  if (parsed.protocol !== "https:") {
    throw new SourceSecurityError("protocol_not_allowed");
  }
  if (parsed.username || parsed.password) {
    throw new SourceSecurityError("credentials_not_allowed");
  }
  if (parsed.port && parsed.port !== "443") {
    throw new SourceSecurityError("port_not_allowed");
  }
  if (!allowedHosts.includes(parsed.hostname.toLowerCase())) {
    throw new SourceSecurityError("host_not_allowlisted");
  }
  if (isIP(parsed.hostname)) {
    throw new SourceSecurityError("host_not_allowlisted");
  }

  parsed.hash = "";
  return parsed;
}

export function assertPublicDnsAddresses(addresses: readonly string[]) {
  if (addresses.length === 0 || addresses.some((address) => !isPublicIpAddress(address))) {
    throw new SourceSecurityError("non_public_address");
  }
}

export function normalizeMimeType(contentType: string | null) {
  return contentType?.split(";", 1)[0]?.trim().toLowerCase() ?? "";
}

export function hasExpectedMagicBytes(mimeType: string, bytes: Uint8Array) {
  if (bytes.length === 0) return false;

  if (mimeType === "application/pdf") {
    return new TextDecoder("ascii").decode(bytes.slice(0, 5)) === "%PDF-";
  }

  const prefix = new TextDecoder("utf-8", { fatal: false })
    .decode(bytes.slice(0, 1024))
    .replace(/^\uFEFF/, "")
    .trimStart()
    .toLowerCase();

  if (mimeType === "text/html" || mimeType === "application/xhtml+xml") {
    return prefix.startsWith("<");
  }

  if (
    mimeType === "application/xml" ||
    mimeType === "text/xml" ||
    mimeType === "application/rss+xml" ||
    mimeType === "application/atom+xml"
  ) {
    return (
      prefix.startsWith("<?xml") ||
      prefix.startsWith("<rss") ||
      prefix.startsWith("<feed") ||
      prefix.startsWith("<urlset") ||
      prefix.startsWith("<sitemapindex")
    );
  }

  return false;
}

export function assessDiscoveryChange(
  previousItemCount: number | null,
  currentItemCount: number,
): DiscoveryAssessment {
  const reasons: DiscoveryAssessment["reasons"] = [];

  if (currentItemCount === 0) {
    reasons.push("zero_results");
  }

  const changeRatio =
    previousItemCount && previousItemCount > 0
      ? Math.abs(currentItemCount - previousItemCount) / previousItemCount
      : null;

  if (changeRatio !== null && changeRatio > 0.5) {
    reasons.push("item_count_change_over_50_percent");
  }

  return { quarantine: reasons.length > 0, reasons, changeRatio };
}

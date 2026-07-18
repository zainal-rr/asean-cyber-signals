import { createHash } from "node:crypto";
import { lookup as dnsLookup } from "node:dns/promises";

import {
  assertPublicDnsAddresses,
  hasExpectedMagicBytes,
  normalizeMimeType,
  SourceSecurityError,
  validateSourceUrl,
} from "./security";
import type {
  ProbeFailureCode,
  SourceProbeResult,
  SourceTarget,
} from "./types";

const MAX_REDIRECTS = 3;
const PROBE_BYTES = 64 * 1024;
const REQUEST_TIMEOUT_MS = 10_000;
const RETRY_DELAY_MS = 350;
const VALIDATOR_CACHE_LIMIT = 128;

type CachedProbe = {
  canonicalUrl: string;
  contentType: string;
  contentLength: number | null;
  probeBytes: number;
  contentHash: string;
  etag: string | null;
  lastModified: string | null;
};

const VALIDATOR_CACHE_KEY = Symbol.for(
  "asean-cyber-signals.ingestion-validator-cache",
);

function validatorCache() {
  const globalState = globalThis as typeof globalThis & {
    [VALIDATOR_CACHE_KEY]?: Map<string, CachedProbe>;
  };
  globalState[VALIDATOR_CACHE_KEY] ??= new Map<string, CachedProbe>();
  return globalState[VALIDATOR_CACHE_KEY];
}

function cacheProbe(url: string, probe: CachedProbe) {
  const cache = validatorCache();
  if (!cache.has(url) && cache.size >= VALIDATOR_CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(url, probe);
}

export type LookupImplementation = (
  hostname: string,
) => Promise<readonly { address: string; family: number }[]>;

export type SafeFetchDependencies = {
  fetchImpl?: typeof fetch;
  lookupImpl?: LookupImplementation;
  now?: () => Date;
};

class ProbeError extends Error {
  constructor(
    readonly code: ProbeFailureCode,
    readonly retryable: boolean,
    readonly quarantined: boolean,
    readonly httpStatus: number | null = null,
  ) {
    super(code);
    this.name = "ProbeError";
  }
}

function mapSecurityError(error: SourceSecurityError) {
  return new ProbeError(error.code, false, true);
}

async function defaultLookup(hostname: string) {
  return dnsLookup(hostname, { all: true, verbatim: true });
}

async function validateDns(hostname: string, lookupImpl: LookupImplementation) {
  try {
    const addresses = await lookupImpl(hostname);
    assertPublicDnsAddresses(addresses.map(({ address }) => address));
  } catch (error) {
    if (error instanceof SourceSecurityError) throw mapSecurityError(error);
    throw new ProbeError("dns_resolution_failed", true, false);
  }
}

function declaredDocumentLength(response: Response) {
  const contentRange = response.headers.get("content-range");
  const rangeTotal = contentRange?.match(/\/(\d+)$/)?.[1];
  const rawLength = rangeTotal ?? response.headers.get("content-length");
  if (!rawLength) return null;

  const parsed = Number(rawLength);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
}

async function readProbe(response: Response, documentLimit: number) {
  if (!response.body) return new Uint8Array();

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  try {
    while (received < PROBE_BYTES) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!value) continue;

      received += value.byteLength;
      if (received > documentLimit) {
        throw new ProbeError("document_too_large", false, true);
      }
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => undefined);
  }

  const combined = new Uint8Array(Math.min(received, PROBE_BYTES));
  let offset = 0;
  for (const chunk of chunks) {
    const remaining = combined.byteLength - offset;
    if (remaining <= 0) break;
    const segment = chunk.slice(0, remaining);
    combined.set(segment, offset);
    offset += segment.byteLength;
  }
  return combined;
}

async function fetchOnce(
  target: SourceTarget,
  allowedHosts: readonly string[],
  dependencies: SafeFetchDependencies,
) {
  const fetchImpl = dependencies.fetchImpl ?? fetch;
  const lookupImpl = dependencies.lookupImpl ?? defaultLookup;
  let currentUrl: URL;

  try {
    currentUrl = validateSourceUrl(target.url, allowedHosts);
  } catch (error) {
    if (error instanceof SourceSecurityError) throw mapSecurityError(error);
    throw error;
  }

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    await validateDns(currentUrl.hostname, lookupImpl);

    const cached = validatorCache().get(currentUrl.toString());
    const requestHeaders: Record<string, string> = {
      Accept: target.expectedMimeTypes.join(", "),
      "Accept-Encoding": "identity",
      Range: `bytes=0-${PROBE_BYTES - 1}`,
      "User-Agent": "ASEAN-Cyber-Signals-Source-Monitor/1.0",
    };
    if (cached?.etag) requestHeaders["If-None-Match"] = cached.etag;
    if (cached?.lastModified) {
      requestHeaders["If-Modified-Since"] = cached.lastModified;
    }

    let response: Response;
    try {
      response = await fetchImpl(currentUrl, {
        method: "GET",
        redirect: "manual",
        credentials: "omit",
        cache: "no-store",
        referrer: "",
        headers: requestHeaders,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "TimeoutError") {
        throw new ProbeError("timeout", true, false);
      }
      throw new ProbeError("network_error", true, false);
    }

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      await response.body?.cancel().catch(() => undefined);
      if (redirectCount === MAX_REDIRECTS) {
        throw new ProbeError("redirect_limit_exceeded", false, true);
      }
      const location = response.headers.get("location");
      if (!location) {
        throw new ProbeError("redirect_missing_location", false, true);
      }
      try {
        currentUrl = validateSourceUrl(
          new URL(location, currentUrl).toString(),
          allowedHosts,
        );
      } catch (error) {
        if (error instanceof SourceSecurityError) throw mapSecurityError(error);
        throw error;
      }
      continue;
    }

    if (response.status === 304 && cached) {
      await response.body?.cancel().catch(() => undefined);
      return {
        ...cached,
        httpStatus: 304,
        etag: response.headers.get("etag") ?? cached.etag,
        lastModified:
          response.headers.get("last-modified") ?? cached.lastModified,
        notModified: true,
      };
    }

    if (!response.ok) {
      await response.body?.cancel().catch(() => undefined);
      throw new ProbeError(
        "http_error",
        response.status === 429 || response.status >= 500,
        false,
        response.status,
      );
    }

    const contentType = normalizeMimeType(response.headers.get("content-type"));
    if (!target.expectedMimeTypes.includes(contentType)) {
      await response.body?.cancel().catch(() => undefined);
      throw new ProbeError("unexpected_content_type", false, true, response.status);
    }

    const contentLength = declaredDocumentLength(response);
    if (contentLength !== null && contentLength > target.maxDocumentBytes) {
      await response.body?.cancel().catch(() => undefined);
      throw new ProbeError("document_too_large", false, true, response.status);
    }

    const body = await readProbe(response, target.maxDocumentBytes);
    if (!hasExpectedMagicBytes(contentType, body)) {
      throw new ProbeError("magic_bytes_mismatch", false, true, response.status);
    }

    const probe = {
      canonicalUrl: currentUrl.toString(),
      contentType,
      contentLength,
      probeBytes: body.byteLength,
      contentHash: createHash("sha256").update(body).digest("hex"),
      etag: response.headers.get("etag"),
      lastModified: response.headers.get("last-modified"),
    };
    cacheProbe(currentUrl.toString(), probe);
    return { ...probe, httpStatus: response.status, notModified: false };
  }

  throw new ProbeError("redirect_limit_exceeded", false, true);
}

function pause(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export async function probeSourceTarget(
  target: SourceTarget,
  allowedHosts: readonly string[],
  dependencies: SafeFetchDependencies = {},
): Promise<SourceProbeResult> {
  const checkedAt = (dependencies.now?.() ?? new Date()).toISOString();

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const result = await fetchOnce(target, allowedHosts, dependencies);
      return { ok: true, targetId: target.id, checkedAt, ...result };
    } catch (error) {
      const normalized =
        error instanceof ProbeError
          ? error
          : new ProbeError("network_error", true, false);

      if (normalized.retryable && attempt === 0) {
        await pause(RETRY_DELAY_MS);
        continue;
      }

      return {
        ok: false,
        targetId: target.id,
        checkedAt,
        code: normalized.code,
        retryable: normalized.retryable,
        quarantined: normalized.quarantined,
        httpStatus: normalized.httpStatus,
      };
    }
  }

  return {
    ok: false,
    targetId: target.id,
    checkedAt,
    code: "network_error",
    retryable: true,
    quarantined: false,
    httpStatus: null,
  };
}

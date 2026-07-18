import { describe, expect, it, vi } from "vitest";

import { probeSourceTarget } from "../safe-fetch";
import type { SourceTarget } from "../types";

const target: SourceTarget = {
  id: "test-source",
  label: "Test source",
  url: "https://official.example/publications",
  kind: "listing",
  cadenceMinutes: 240,
  expectedMimeTypes: ["text/html"],
  maxDocumentBytes: 1024 * 1024,
};

const publicDns = async () => [{ address: "93.184.216.34", family: 4 }];

describe("bounded source probe", () => {
  it("returns only safe metadata for an accepted response", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response("<!doctype html><title>Official</title>", {
        status: 200,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "content-length": "43",
          etag: '"v1"',
        },
      }),
    );

    const result = await probeSourceTarget(target, ["official.example"], {
      fetchImpl: fetchImpl as typeof fetch,
      lookupImpl: publicDns,
      now: () => new Date("2026-07-18T00:00:00.000Z"),
    });

    expect(result.ok).toBe(true);
    expect(result).toMatchObject({
      targetId: "test-source",
      httpStatus: 200,
      contentType: "text/html",
      etag: '"v1"',
    });
    expect(fetchImpl).toHaveBeenCalledOnce();
  });

  it("uses a validated ETag for a conditional follow-up probe", async () => {
    const followUpFetch = vi.fn(async (_input: URL | RequestInfo, init?: RequestInit) => {
      const headers = new Headers(init?.headers);
      expect(headers.get("if-none-match")).toBe('"v1"');
      return new Response(null, {
        status: 304,
        headers: { etag: '"v1"' },
      });
    });

    const result = await probeSourceTarget(target, ["official.example"], {
      fetchImpl: followUpFetch as typeof fetch,
      lookupImpl: publicDns,
    });

    expect(result).toMatchObject({
      ok: true,
      httpStatus: 304,
      notModified: true,
      contentType: "text/html",
    });
  });

  it("blocks a private DNS answer before the request", async () => {
    const fetchImpl = vi.fn();
    const result = await probeSourceTarget(target, ["official.example"], {
      fetchImpl: fetchImpl as typeof fetch,
      lookupImpl: async () => [{ address: "169.254.169.254", family: 4 }],
    });

    expect(result).toMatchObject({
      ok: false,
      code: "non_public_address",
      quarantined: true,
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("revalidates redirects and blocks a host change", async () => {
    const fetchImpl = vi.fn(async () =>
      new Response(null, {
        status: 302,
        headers: { location: "https://evil.example/internal" },
      }),
    );
    const result = await probeSourceTarget(target, ["official.example"], {
      fetchImpl: fetchImpl as typeof fetch,
      lookupImpl: publicDns,
    });

    expect(result).toMatchObject({
      ok: false,
      code: "host_not_allowlisted",
      quarantined: true,
    });
  });

  it("quarantines an unexpected content type", async () => {
    const result = await probeSourceTarget(target, ["official.example"], {
      fetchImpl: (async () =>
        new Response("{}", {
          status: 200,
          headers: { "content-type": "application/json" },
        })) as typeof fetch,
      lookupImpl: publicDns,
    });

    expect(result).toMatchObject({
      ok: false,
      code: "unexpected_content_type",
      quarantined: true,
    });
  });
});

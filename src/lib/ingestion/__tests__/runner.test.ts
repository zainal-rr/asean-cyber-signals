import { beforeEach, describe, expect, it } from "vitest";

import { recordSourceHealth, resetSourceHealthForTests } from "../health";
import { resolveManualInboxSource } from "../registry";
import { runManualInboxProbe } from "../runner";

beforeEach(() => resetSourceHealthForTests());

describe("source health", () => {
  it("marks a source degraded after three consecutive failures", () => {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      expect(
        recordSourceHealth("id_idsirtii", {
          succeeded: false,
          quarantined: false,
          checkedAt: `2026-07-18T00:0${attempt}:00.000Z`,
        }).health,
      ).toBe("shadow");
    }

    expect(
      recordSourceHealth("id_idsirtii", {
        succeeded: false,
        quarantined: false,
        checkedAt: "2026-07-18T00:03:00.000Z",
      }),
    ).toMatchObject({ health: "degraded", consecutiveFailures: 3 });
  });
});

describe("manual source inbox", () => {
  it("recognizes only fixed official manual and adapter hosts", () => {
    expect(
      resolveManualInboxSource("https://jdih.komdigi.go.id/produk_hukum/view/832"),
    ).toMatchObject({ sourceKey: "id_manual_official", country: "ID" });
    expect(
      resolveManualInboxSource("http://jdih.komdigi.go.id/produk_hukum/view/832"),
    ).toBeNull();
    expect(resolveManualInboxSource("https://attacker.example/report.pdf")).toBeNull();
  });

  it("places a validated PDF into review without publishing", async () => {
    const result = await runManualInboxProbe(
      "https://jdih.komdigi.go.id/report.pdf",
      "Official regulation",
      {
        fetchImpl: (async () =>
          new Response("%PDF-1.7\nbody", {
            status: 200,
            headers: { "content-type": "application/pdf" },
          })) as typeof fetch,
        lookupImpl: async () => [{ address: "203.119.13.7", family: 4 }],
      },
    );

    expect(result).toMatchObject({
      status: "needs_review",
      autoPublish: false,
      sourceKey: "id_manual_official",
      check: { ok: true, contentType: "application/pdf" },
    });
  });
});

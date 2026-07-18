import { recordSourceHealth } from "./health";
import { createHash } from "node:crypto";

import {
  getSourceAdapter,
  listSourceAdapters,
  resolveManualInboxSource,
} from "./registry";
import {
  probeSourceTarget,
  type SafeFetchDependencies,
} from "./safe-fetch";
import { validateSourceUrl } from "./security";
import type {
  AdapterId,
  AdapterRunResult,
  ManualInboxResult,
  SourceTarget,
} from "./types";

export async function runSourceAdapter(
  adapterId: AdapterId,
  dependencies: SafeFetchDependencies = {},
): Promise<AdapterRunResult> {
  const adapter = getSourceAdapter(adapterId);
  const startedAt = (dependencies.now?.() ?? new Date()).toISOString();
  const checks = await Promise.all(
    adapter.targets.map((target) =>
      probeSourceTarget(target, adapter.allowedHosts, dependencies),
    ),
  );
  const finishedAt = (dependencies.now?.() ?? new Date()).toISOString();
  const succeeded = checks.every((check) => check.ok);
  const quarantined = checks.some((check) => !check.ok && check.quarantined);
  const status = quarantined ? "quarantined" : succeeded ? "succeeded" : "failed";
  const health = recordSourceHealth(adapterId, {
    succeeded,
    quarantined,
    checkedAt: finishedAt,
  });

  return {
    adapterId,
    country: adapter.country,
    publisher: adapter.publisher,
    mode: "shadow_discovery",
    status,
    startedAt,
    finishedAt,
    health,
    checks,
    nextItemState: quarantined
      ? "quarantined"
      : succeeded
        ? "needs_review"
        : "no_change",
    autoPublish: false,
  };
}

export async function runSourceAdapters(adapterId?: AdapterId) {
  const adapters = adapterId ? [getSourceAdapter(adapterId)] : listSourceAdapters();
  return Promise.all(adapters.map((adapter) => runSourceAdapter(adapter.id)));
}

export async function runManualInboxProbe(
  submittedUrl: string,
  label: string,
  dependencies: SafeFetchDependencies = {},
): Promise<ManualInboxResult | null> {
  const source = resolveManualInboxSource(submittedUrl);
  if (!source) return null;

  const normalizedUrl = validateSourceUrl(
    submittedUrl,
    source.allowedHosts,
  ).toString();
  const target: SourceTarget = {
    id: "manual-inbox",
    label,
    url: normalizedUrl,
    kind: "publication_index",
    cadenceMinutes: 0,
    expectedMimeTypes: [
      "text/html",
      "application/xhtml+xml",
      "application/pdf",
      "application/xml",
      "text/xml",
    ],
    maxDocumentBytes: 20 * 1024 * 1024,
  };
  const check = await probeSourceTarget(target, source.allowedHosts, dependencies);

  return {
    inboxId: `inbox_${createHash("sha256").update(normalizedUrl).digest("hex").slice(0, 16)}`,
    sourceKey: source.sourceKey,
    country: source.country,
    publisher: source.publisher,
    submittedUrl: normalizedUrl,
    label,
    status: check.ok ? "needs_review" : "quarantined",
    check,
    autoPublish: false,
  };
}

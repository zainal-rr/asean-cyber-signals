import type {
  AdapterId,
  SourceHealthSnapshot,
} from "./types";

type StoredHealth = {
  consecutiveFailures: number;
  lastCheckedAt: string;
  lastSuccessfulAt: string | null;
};

const HEALTH_STATE_KEY = Symbol.for("asean-cyber-signals.ingestion-health");

function healthStore() {
  const globalState = globalThis as typeof globalThis & {
    [HEALTH_STATE_KEY]?: Map<AdapterId, StoredHealth>;
  };
  globalState[HEALTH_STATE_KEY] ??= new Map<AdapterId, StoredHealth>();
  return globalState[HEALTH_STATE_KEY];
}

export function recordSourceHealth(
  adapterId: AdapterId,
  outcome: { succeeded: boolean; quarantined: boolean; checkedAt: string },
): SourceHealthSnapshot {
  const previous = healthStore().get(adapterId);
  const consecutiveFailures = outcome.succeeded
    ? 0
    : (previous?.consecutiveFailures ?? 0) + 1;
  const lastSuccessfulAt = outcome.succeeded
    ? outcome.checkedAt
    : (previous?.lastSuccessfulAt ?? null);
  const health = outcome.quarantined
    ? "quarantined"
    : consecutiveFailures >= 3
      ? "degraded"
      : outcome.succeeded
        ? "healthy"
        : "shadow";

  const stored = {
    consecutiveFailures,
    lastCheckedAt: outcome.checkedAt,
    lastSuccessfulAt,
  };
  healthStore().set(adapterId, stored);

  return { health, ...stored };
}

export function resetSourceHealthForTests() {
  healthStore().clear();
}

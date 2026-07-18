import * as Sentry from "@sentry/nextjs";

import { scrubSentryEvent } from "./src/lib/observability/sentry";

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  sendDefaultPii: false,
  tracesSampleRate: 0.05,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  beforeSend: scrubSentryEvent,
});

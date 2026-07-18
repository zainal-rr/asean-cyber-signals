type ScrubbableEvent = {
  user?: unknown;
  request?: {
    cookies?: unknown;
    data?: unknown;
    headers?: Record<string, string | undefined>;
  };
};

const SENSITIVE_HEADERS = [
  "authorization",
  "cookie",
  "set-cookie",
  "x-supabase-auth",
] as const;

export function scrubSentryEvent<T extends ScrubbableEvent>(event: T) {
  delete event.user;
  if (event.request) {
    delete event.request.cookies;
    delete event.request.data;
    for (const header of Object.keys(event.request.headers ?? {})) {
      if (SENSITIVE_HEADERS.includes(header.toLowerCase() as never)) {
        delete event.request.headers?.[header];
      }
    }
  }
  return event;
}

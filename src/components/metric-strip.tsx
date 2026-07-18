import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function MetricStrip({
  items,
}: {
  items: Array<{ label: string; value: ReactNode; detail?: string }>;
}) {
  return (
    <dl className="grid overflow-hidden rounded-lg border border-line bg-surface sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <div
          key={item.label}
          className={cn(
            "min-h-28 px-5 py-4",
            index === 1 && "border-t border-line sm:border-l sm:border-t-0",
            index === 2 && "border-t border-line sm:border-l-0 xl:border-l xl:border-t-0",
            index === 3 && "border-t border-line sm:border-l xl:border-t-0",
          )}
        >
          <dt className="text-xs font-semibold text-subtle">{item.label}</dt>
          <dd className="numeric mt-2 font-mono text-3xl font-semibold tracking-tight text-foreground">
            {item.value}
          </dd>
          {item.detail && <dd className="mt-1 text-xs text-muted">{item.detail}</dd>}
        </div>
      ))}
    </dl>
  );
}

"use client";

import { WarningCircle } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";

export default function ProductError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-lg flex-col items-center justify-center px-6 text-center">
      <WarningCircle size={38} className="text-danger" weight="duotone" />
      <h1 className="mt-4 text-2xl font-semibold text-foreground">This view could not load</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        The last reviewed data remains unchanged. Retry the request or return to the overview.
      </p>
      <Button className="mt-6" onClick={reset}>
        Retry
      </Button>
    </div>
  );
}

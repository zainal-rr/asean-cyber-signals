"use client";

import type { ReactNode } from "react";

import { usePresentationMode } from "@/components/presentation-provider";

export function InternalOnly({ children }: { children: ReactNode }) {
  const { enabled } = usePresentationMode();
  return enabled ? null : children;
}

export function PresentationOnly({ children }: { children: ReactNode }) {
  const { enabled } = usePresentationMode();
  return enabled ? children : null;
}

import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";

import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <main className="grid min-h-[100dvh] bg-surface lg:grid-cols-[minmax(420px,0.84fr)_1.16fr]">
      <section className="flex min-h-[100dvh] flex-col px-6 py-6 sm:px-10 lg:px-14 lg:py-10">
        <div className="flex items-center gap-3">
          <span
            className="flex size-10 items-center justify-center rounded-lg bg-accent font-mono text-xs font-bold text-white"
            aria-hidden="true"
          >
            AS
          </span>
          <div>
            <p className="text-sm font-bold tracking-tight text-foreground">
              ASEAN Cyber Signals
            </p>
            <p className="text-xs text-subtle">Presales intelligence</p>
          </div>
        </div>

        <div className="my-auto max-w-md py-12">
          <h1 className="text-balance text-4xl font-semibold leading-[1.08] tracking-[-0.035em] text-foreground sm:text-5xl">
            Turn regional signals into stronger security conversations.
          </h1>
          <p className="mt-5 max-w-[40ch] text-base leading-7 text-muted">
            Reviewed evidence, Cisco-aligned outcomes, and cited briefs for three Southeast Asian markets.
          </p>
          <Suspense fallback={<div className="mt-8 h-80 animate-pulse rounded-lg bg-surface-subtle" />}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="max-w-md text-xs leading-5 text-subtle">
          Public-source presales prototype. Verify current product capabilities and customer requirements before use.
        </p>
      </section>

      <section className="relative hidden min-h-[100dvh] overflow-hidden border-l border-line bg-[#edf5f7] lg:block">
        <Image
          src="/brand/asean-cyber-signals-hero.webp"
          alt="Three connected cyber-signal clusters representing Singapore, Malaysia, and Indonesia"
          fill
          priority
          sizes="(min-width: 1024px) 58vw, 0vw"
          className="object-cover object-center"
        />
        <div className="absolute bottom-10 left-10 max-w-xs rounded-lg border border-white/75 bg-white/92 p-4 shadow-[0_16px_40px_rgb(15_55_72_/_0.12)]">
          <p className="text-sm font-semibold text-foreground">Evidence before positioning</p>
          <p className="mt-1 text-sm leading-6 text-muted">
            Every customer-ready statement keeps its source, observation period, and review status.
          </p>
        </div>
      </section>
    </main>
  );
}

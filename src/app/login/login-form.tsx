"use client";

import { ArrowRight, LockKey } from "@phosphor-icons/react";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = React.useState<string | null>(
    searchParams.get("error") ? "Sign-in failed. Check your credentials." : null,
  );
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          username: String(form.get("username") ?? ""),
          password: String(form.get("password") ?? ""),
        }),
      });

      if (!response.ok) {
        setError("Sign-in failed. Check your credentials.");
        return;
      }

      router.replace("/dashboard");
      router.refresh();
    } catch {
      setError("The sign-in service is unavailable. Try again shortly.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 grid gap-5" aria-busy={loading}>
      <div className="grid gap-2">
        <label htmlFor="username" className="text-sm font-semibold text-foreground">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          className="h-12 rounded-lg border border-line-strong bg-surface px-3 text-foreground placeholder:text-subtle hover:border-accent focus:border-focus focus:outline-none"
          placeholder="Your owner username"
        />
      </div>
      <div className="grid gap-2">
        <label htmlFor="password" className="text-sm font-semibold text-foreground">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-12 rounded-lg border border-line-strong bg-surface px-3 text-foreground placeholder:text-subtle hover:border-accent focus:border-focus focus:outline-none"
          placeholder="Your password"
        />
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-lg border border-[#fecdca] bg-danger-soft px-3 py-2 text-sm font-medium text-danger"
        >
          {error}
        </p>
      )}
      <Button type="submit" disabled={loading} className="w-full justify-between px-4">
        <span>{loading ? "Signing in" : "Open workspace"}</span>
        <ArrowRight size={19} aria-hidden="true" />
      </Button>
      <p className="flex items-start gap-2 text-xs leading-5 text-subtle">
        <LockKey size={17} className="mt-0.5 shrink-0" aria-hidden="true" />
        Access is limited to the owner account configured for this deployment.
      </p>
    </form>
  );
}

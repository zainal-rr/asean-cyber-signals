import { Compass } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-6 text-center">
      <Compass size={42} className="text-accent" weight="duotone" />
      <h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground">Signal not found</h1>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted">
        The requested page may have been archived or the link is incomplete.
      </p>
      <Button asChild className="mt-6">
        <Link href="/dashboard">Return to overview</Link>
      </Button>
    </main>
  );
}

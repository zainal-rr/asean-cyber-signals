import { AppShell } from "@/components/app-shell";
import { requireOwnerSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function ProductLayout({ children }: { children: React.ReactNode }) {
  await requireOwnerSession();
  return <AppShell>{children}</AppShell>;
}

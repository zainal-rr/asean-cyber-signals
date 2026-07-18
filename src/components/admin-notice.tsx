import { LockKey } from "@phosphor-icons/react/dist/ssr";

export function AdminNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-line bg-surface-subtle px-4 py-3 text-sm leading-6 text-muted">
      <LockKey size={20} className="mt-0.5 shrink-0 text-accent" weight="duotone" />
      <p>{children}</p>
    </div>
  );
}

import { Info } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";

export function MethodologyNote({ children }: { children: ReactNode }) {
  return (
    <aside className="flex gap-3 rounded-lg border border-[#b2ddff] bg-[#eff8ff] p-4 text-sm leading-6 text-[#175cd3]">
      <Info size={20} className="mt-0.5 shrink-0" weight="duotone" />
      <div>{children}</div>
    </aside>
  );
}

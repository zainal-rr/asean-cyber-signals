import { cn } from "@/lib/utils";

const countryNames = {
  SG: "Singapore",
  MY: "Malaysia",
  ID: "Indonesia",
} as const;

export function CountryCode({
  code,
  className,
}: {
  code: keyof typeof countryNames;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#b7dce7] bg-surface-selected font-mono text-xs font-bold text-accent-hover",
        className,
      )}
      title={countryNames[code]}
      aria-label={countryNames[code]}
    >
      {code}
    </span>
  );
}

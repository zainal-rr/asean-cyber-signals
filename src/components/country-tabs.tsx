import Link from "next/link";

import { CountryCode } from "@/components/country-code";
import type { Country, CountryCode as CountryCodeType } from "@/lib/domain/types";
import { cn } from "@/lib/utils";

export function CountryTabs({
  countries,
  active,
}: {
  countries: readonly Country[];
  active: CountryCodeType;
}) {
  return (
    <nav aria-label="Country views" className="overflow-x-auto scrollbar-subtle">
      <div className="flex min-w-max gap-2 rounded-lg border border-line bg-surface p-2">
        {countries.map((country) => {
          const selected = country.code === active;
          return (
            <Link
              key={country.code}
              href={`/countries/${country.code}`}
              aria-current={selected ? "page" : undefined}
              className={cn(
                "flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition-colors",
                selected
                  ? "bg-surface-selected text-accent-hover"
                  : "text-muted hover:bg-surface-subtle hover:text-foreground",
              )}
            >
              <CountryCode code={country.code} className="size-7 rounded-md" />
              {country.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

import { Badge } from "@/components/ui/badge";
import { getScoreBand } from "@/lib/domain/scoring";
import { cn } from "@/lib/utils";

const labels = {
  low: "Low",
  moderate: "Moderate",
  high: "High",
  "very-high": "Very high",
} as const;

export function ScoreDisplay({
  score,
  label,
  compact = false,
  className,
}: {
  score: number;
  label: string;
  compact?: boolean;
  className?: string;
}) {
  const band = getScoreBand(score);
  const variant =
    band === "very-high" ? "danger" : band === "high" ? "warning" : "neutral";

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <span className="numeric font-mono text-lg font-semibold text-foreground">
          {score}
        </span>
        <span className="text-xs text-subtle">{label}</span>
      </div>
    );
  }

  return (
    <div className={cn("min-w-32", className)}>
      <div className="flex items-center gap-2">
        <span className="numeric font-mono text-3xl font-semibold tracking-tight text-foreground">
          {score}
        </span>
        <span className="text-xs text-subtle">/100</span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <p className="text-xs font-semibold text-muted">{label}</p>
        <Badge variant={variant}>{labels[band]}</Badge>
      </div>
    </div>
  );
}

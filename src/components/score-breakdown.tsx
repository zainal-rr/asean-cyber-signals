import type { Rating } from "@/lib/domain/types";

export function ScoreBreakdown({
  items,
}: {
  items: readonly { label: string; value: Rating; weight: number }[];
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-surface-subtle text-xs text-subtle">
          <tr>
            <th scope="col" className="px-3 py-2.5 font-semibold">Input</th>
            <th scope="col" className="px-3 py-2.5 text-right font-semibold">Rating</th>
            <th scope="col" className="px-3 py-2.5 text-right font-semibold">Weight</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line bg-surface">
          {items.map((item) => (
            <tr key={item.label}>
              <th scope="row" className="px-3 py-2.5 font-medium text-muted">{item.label}</th>
              <td className="numeric px-3 py-2.5 text-right font-mono font-semibold text-foreground">{item.value}/5</td>
              <td className="numeric px-3 py-2.5 text-right font-mono text-subtle">{item.weight}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

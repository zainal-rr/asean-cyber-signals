"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { usePresentationMode } from "@/components/presentation-provider";

type CountryScore = {
  country: string;
  threatPriority: number;
  opportunityFit: number;
};

export function CountryPriorityChart({ data }: { data: CountryScore[] }) {
  const { enabled } = usePresentationMode();
  return (
    <div>
      <div className="h-64 w-full" role="img" aria-label="Average priority scores by country">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 12, right: 8, left: -24, bottom: 0 }} accessibilityLayer>
            <CartesianGrid vertical={false} stroke="#d7e1e8" strokeDasharray="2 4" />
            <XAxis dataKey="country" tickLine={false} axisLine={false} tick={{ fill: "#475569", fontSize: 12 }} />
            <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
            <Tooltip
              cursor={{ fill: "#f0f5f8" }}
              contentStyle={{
                border: "1px solid #d7e1e8",
                borderRadius: 8,
                boxShadow: "0 18px 48px rgb(15 55 72 / 0.14)",
                fontSize: 12,
              }}
            />
            <Bar dataKey="threatPriority" name="Threat priority" fill="#006b8f" radius={[4, 4, 0, 0]} maxBarSize={36} />
            {!enabled && (
              <Bar dataKey="opportunityFit" name="Opportunity fit" fill="#8ca6b5" radius={[4, 4, 0, 0]} maxBarSize={36} />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <table className="sr-only">
        <caption>Average priority scores by country</caption>
        <thead>
          <tr>
            <th scope="col">Country</th>
            <th scope="col">Threat priority</th>
            {!enabled && <th scope="col">Opportunity fit</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.country}>
              <th scope="row">{row.country}</th>
              <td>{row.threatPriority}</td>
              {!enabled && <td>{row.opportunityFit}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

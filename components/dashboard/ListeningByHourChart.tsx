"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { ListeningByHour } from "@/lib/types";

interface ListeningByHourChartProps {
  data: ListeningByHour[];
}

// Fill missing hours so the chart always shows 0–23
function fillAllHours(data: ListeningByHour[]): { hour: string; plays: number }[] {
  const map: Record<number, number> = {};
  data.forEach((d) => {
    map[Number(d.played_hour)] = Number(d.play_count);
  });
  return Array.from({ length: 24 }, (_, h) => ({
    hour: `${h}:00`,
    plays: map[h] ?? 0,
  }));
}

export function ListeningByHourChart({ data }: ListeningByHourChartProps) {
  const chartData = fillAllHours(data);

  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Listening by Hour</h3>
      {data.length === 0 ? (
        <p className="text-zinc-500 text-sm">No data yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} barSize={10}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="hour"
              tick={{ fill: "#71717a", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              interval={3}
            />
            <YAxis
              tick={{ fill: "#71717a", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#18181b",
                border: "1px solid #3f3f46",
                borderRadius: "8px",
                color: "#fff",
              }}
              labelStyle={{ color: "#a1a1aa" }}
              cursor={{ fill: "#27272a" }}
            />
            <Bar dataKey="plays" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import type { ListeningByDay } from "@/lib/types";

interface ListeningByDayChartProps {
  data: ListeningByDay[];
}

export function ListeningByDayChart({ data }: ListeningByDayChartProps) {
  const chartData = data.map((d) => ({
    date: d.played_date,
    plays: Number(d.play_count),
  }));

  return (
    <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Listening by Day</h3>
      {data.length === 0 ? (
        <p className="text-zinc-500 text-sm">No data yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "#71717a", fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v.slice(5)}
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
              cursor={{ stroke: "#3f3f46" }}
            />
            <Area
              type="monotone"
              dataKey="plays"
              stroke="#22c55e"
              strokeWidth={2}
              fill="url(#greenGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

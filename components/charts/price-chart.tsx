"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type PriceChartProps = {
  points: Array<{ t: string; close: number }>;
};

export function PriceChart({ points }: PriceChartProps) {
  return (
    <div className="panel h-[280px] p-4">
      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-terminal-dim">Price Trend</p>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart data={points}>
          <XAxis dataKey="t" tick={{ fill: "#84a6a1", fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis domain={["dataMin - 0.5", "dataMax + 0.5"]} tick={{ fill: "#84a6a1", fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{ background: "#101b20", borderColor: "#1f3a42", borderRadius: 8 }}
            labelStyle={{ color: "#84a6a1" }}
            itemStyle={{ color: "#38d39f" }}
          />
          <Line type="monotone" dataKey="close" stroke="#38d39f" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

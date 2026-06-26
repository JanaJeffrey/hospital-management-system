"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import PremiumCard from "./PremiumCard";

const data = [
  { month: "Jan", appointments: 12 },
  { month: "Feb", appointments: 19 },
  { month: "Mar", appointments: 15 },
  { month: "Apr", appointments: 27 },
  { month: "May", appointments: 32 },
  { month: "Jun", appointments: 28 },
];

export default function ChartCard() {
  return (
    <PremiumCard className="col-span-2">
      <h3 className="text-lg font-semibold mb-4">Appointment Trends</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="color" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="month" stroke="#888" />
          <YAxis stroke="#888" />
          <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
          <Area type="monotone" dataKey="appointments" stroke="#3b82f6" fill="url(#color)" strokeWidth={3} />
        </AreaChart>
      </ResponsiveContainer>
    </PremiumCard>
  );
}
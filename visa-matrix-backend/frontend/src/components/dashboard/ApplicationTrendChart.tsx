import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import SectionCard from "../common/SectionCard";

type TrendPoint = {
  month: string;
  value: number;
};

type ApplicationTrendChartProps = {
  data: TrendPoint[];
};

export default function ApplicationTrendChart({
  data,
}: ApplicationTrendChartProps) {
  return (
    <SectionCard
      title="Application Trend"
      description="Recent application creation volume from the backend case queue."
    >
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid 
              stroke="#d1d5db" 
              strokeDasharray="3 3"
              opacity={0.3}
            />
            <XAxis 
              dataKey="month" 
              stroke="#6b7280"
              style={{ fontSize: "12px", fontWeight: 500 }}
            />
            <YAxis 
              stroke="#6b7280"
              allowDecimals={false}
              style={{ fontSize: "12px", fontWeight: 500 }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid #c7ddf9",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 12px rgba(10, 22, 40, 0.12)",
              }}
              labelStyle={{ color: "#0f2854", fontWeight: 600 }}
              wrapperStyle={{ outline: "none" }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#5a9eef"
              strokeWidth={2.5}
              dot={{ fill: "#5a9eef", r: 4, strokeWidth: 0 }}
              activeDot={{ r: 6, fill: "#2a4fa3" }}
              isAnimationActive={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}

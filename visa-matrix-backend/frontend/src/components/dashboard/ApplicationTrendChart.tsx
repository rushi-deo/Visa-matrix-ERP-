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
      title="Application trend"
      description="Recent application creation volume from the backend case queue."
    >
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
            <XAxis dataKey="month" stroke="#64748B" />
            <YAxis stroke="#64748B" allowDecimals={false} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#1E5BB8"
              strokeWidth={3}
              dot={{ fill: "#2F80ED", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </SectionCard>
  );
}

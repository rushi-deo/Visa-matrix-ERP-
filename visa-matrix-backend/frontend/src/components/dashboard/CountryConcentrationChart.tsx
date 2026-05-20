import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import SectionCard from "../common/SectionCard";

type CountryPoint = {
  name: string;
  value: number;
};

type CountryConcentrationChartProps = {
  data: CountryPoint[];
};

const palette = ["#1E5BB8", "#2F80ED", "#63A4FF", "#A8CCFF"];

export default function CountryConcentrationChart({
  data,
}: CountryConcentrationChartProps) {
  return (
    <SectionCard
      title="Country concentration"
      description="Top application destinations in the current dataset."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_160px]">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke="#64748B" tick={{ fontSize: 12 }} />
              <YAxis stroke="#64748B" allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={palette[index % palette.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={48}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={palette[index % palette.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </SectionCard>
  );
}

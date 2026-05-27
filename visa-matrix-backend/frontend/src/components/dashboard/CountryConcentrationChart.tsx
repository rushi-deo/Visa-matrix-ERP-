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

// Premium metallic color palette
const palette = ["#5a9eef", "#4a8ee3", "#3d7ed6", "#2d6ec8"];

export default function CountryConcentrationChart({
  data,
}: CountryConcentrationChartProps) {
  return (
    <SectionCard
      title="Country Concentration"
      description="Top application destinations in the current dataset."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_160px]">
        {/* Bar Chart */}
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data}
              margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid 
                stroke="#d1d5db" 
                strokeDasharray="3 3"
                opacity={0.3}
              />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280" 
                tick={{ fontSize: 12, fontWeight: 500 }}
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
              <Bar 
                dataKey="value" 
                radius={[8, 8, 0, 0]}
                isAnimationActive={true}
              >
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

        {/* Pie Chart */}
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={48}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                isAnimationActive={true}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={palette[index % palette.length]}
                  />
                ))}
              </Pie>
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
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </SectionCard>
  );
}

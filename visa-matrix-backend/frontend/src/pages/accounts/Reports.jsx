import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import SectionCard from "../../components/common/SectionCard";
import {
  applicationRevenueData,
  countryRevenueData,
  expenseVsIncomeData,
  formatAccountCurrency,
  revenueTrendData,
} from "../../services/accountsService";

const palette = ["#1E5BB8", "#2F80ED", "#63A4FF", "#A8CCFF"];

function MetricTile({ label, value, subtitle }) {
  return (
    <article className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_20px_45px_rgba(11,46,89,0.08)]">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
    </article>
  );
}

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_20px_45px_rgba(11,46,89,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#1E5BB8]">
          Financial reports
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
          Enterprise-grade insights into revenue, collections, and spend
          performance.
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
          Trend analysis, country revenue mix, application profitability, and
          expense vs income reporting in one module.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Monthly revenue"
          value={formatAccountCurrency(452000)}
          subtitle="Current month target reached"
        />
        <MetricTile
          label="Pending dues"
          value={formatAccountCurrency(184250)}
          subtitle="Collections follow-up queue"
        />
        <MetricTile
          label="Expense ratio"
          value="44%"
          subtitle="Stable operating margin"
        />
        <MetricTile
          label="Refund requests"
          value={formatAccountCurrency(14750)}
          subtitle="2 approvals in review"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Monthly revenue"
          description="Revenue and expense movement over the last six reporting periods."
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueTrendData}>
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip
                  formatter={(value) => formatAccountCurrency(Number(value))}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1E5BB8"
                  strokeWidth={3}
                  dot={{ fill: "#2F80ED", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#0F172A"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="Country-wise revenue"
          description="Revenue concentration by destination and service region."
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={countryRevenueData}>
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
                <XAxis
                  dataKey="country"
                  stroke="#64748B"
                  tick={{ fontSize: 12 }}
                />
                <YAxis stroke="#64748B" />
                <Tooltip
                  formatter={(value) => formatAccountCurrency(Number(value))}
                />
                <Bar dataKey="revenue" radius={[10, 10, 0, 0]}>
                  {countryRevenueData.map((entry, index) => (
                    <Cell
                      key={entry.country}
                      fill={palette[index % palette.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard
          title="Application revenue"
          description="Revenue breakdown by service line for active visa operations."
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={applicationRevenueData}
                  dataKey="revenue"
                  nameKey="name"
                  innerRadius={48}
                  outerRadius={80}
                  paddingAngle={4}
                >
                  {applicationRevenueData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={palette[index % palette.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatAccountCurrency(Number(value))}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard
          title="Expense vs income"
          description="Quarterly financial position to keep forecasting and approvals aligned."
        >
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={expenseVsIncomeData}>
                <CartesianGrid stroke="#E2E8F0" strokeDasharray="3 3" />
                <XAxis dataKey="month" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip
                  formatter={(value) => formatAccountCurrency(Number(value))}
                />
                <Bar dataKey="income" fill="#1E5BB8" radius={[8, 8, 0, 0]} />
                <Bar dataKey="expenses" fill="#94A3B8" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

import { Suspense, lazy } from "react";

import LoadingState from "../common/LoadingState";
import type { ApplicationListItem } from "../../types";

type TrendChartsProps = {
  applications: ApplicationListItem[];
};

const ApplicationTrendChart = lazy(() => import("./ApplicationTrendChart"));
const CountryConcentrationChart = lazy(
  () => import("./CountryConcentrationChart")
);

function buildTrendData(applications: ApplicationListItem[]) {
  const buckets: Record<string, number> = {};

  applications.forEach((application) => {
    const key = application.created_at
      ? new Date(application.created_at).toLocaleDateString("en-US", {
          month: "short",
        })
      : "Unknown";

    buckets[key] = (buckets[key] || 0) + 1;
  });

  return Object.entries(buckets).map(([month, value]) => ({ month, value }));
}

function buildCountryData(applications: ApplicationListItem[]) {
  const buckets: Record<string, number> = {};

  applications.forEach((application) => {
    const key = application.country || "Unknown";
    buckets[key] = (buckets[key] || 0) + 1;
  });

  return Object.entries(buckets)
    .slice(0, 5)
    .map(([name, value]) => ({ name, value }));
}

export default function TrendCharts({ applications }: TrendChartsProps) {
  const trendData = buildTrendData(applications);
  const countryData = buildCountryData(applications);

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
      <Suspense fallback={<LoadingState label="Loading trend analytics..." />}>
        <ApplicationTrendChart data={trendData} />
      </Suspense>

      <Suspense
        fallback={<LoadingState label="Loading country concentration..." />}
      >
        <CountryConcentrationChart data={countryData} />
      </Suspense>
    </div>
  );
}

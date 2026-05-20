import SectionCard from "../common/SectionCard";
import type { ApplicationListItem } from "../../types";
import { countryCoordinates } from "../../utils/geo";

type WorldMapCardProps = {
  applications: ApplicationListItem[];
};

function aggregateByCountry(applications: ApplicationListItem[]) {
  const counts: Record<string, number> = {};

  applications.forEach((application) => {
    const country = application.country || "Unknown";
    counts[country] = (counts[country] || 0) + 1;
  });

  return Object.entries(counts)
    .filter(([country]) => countryCoordinates[country])
    .map(([country, count]) => ({
      country,
      count,
      ...countryCoordinates[country],
    }));
}

export default function WorldMapCard({ applications }: WorldMapCardProps) {
  const markers = aggregateByCountry(applications);

  return (
    <SectionCard
      title="World application map"
      description="A live geographic view of current visa demand across destinations."
    >
      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.85fr]">
        <div className="rounded-[28px] bg-[#0B2E59] p-4">
          <svg viewBox="0 0 100 80" className="h-[360px] w-full">
            <rect width="100" height="80" fill="#0B2E59" rx="4" />
            <path
              d="M10 24c5-5 12-9 18-8l8 2 5 7-2 8-8 2-4 5-6-2-6-7z"
              fill="#173F77"
            />
            <path
              d="M34 44l7-3 6 3 3 8-4 12-7 4-7-7-2-10z"
              fill="#173F77"
            />
            <path
              d="M47 20l8-5 14 2 7 8-3 8-10 2-5 8-7-2-4-8z"
              fill="#173F77"
            />
            <path
              d="M51 42l6-2 6 3 2 9-3 10-8 3-5-6-1-10z"
              fill="#173F77"
            />
            <path
              d="M66 28l8-3 13 1 7 6-3 8-8 5-9-1-5-6z"
              fill="#173F77"
            />
            <path
              d="M77 60l8-2 8 4 1 7-8 4-10-3-2-5z"
              fill="#173F77"
            />
            {markers.map((marker) => (
              <g key={marker.country}>
                <circle
                  cx={marker.x}
                  cy={marker.y}
                  r={Math.max(1.8, Math.min(marker.count + 1, 4.6))}
                  fill="#2F80ED"
                  stroke="#E0EEFF"
                  strokeWidth="0.6"
                />
                <circle
                  cx={marker.x}
                  cy={marker.y}
                  r={Math.max(3.4, Math.min(marker.count + 3.8, 7))}
                  fill="#2F80ED"
                  opacity="0.16"
                />
              </g>
            ))}
          </svg>
        </div>

        <div className="space-y-3">
          {markers.length ? (
            markers.map((marker) => (
              <div
                key={marker.country}
                className="rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-900">
                    {marker.country}
                  </p>
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-[#1E5BB8]">
                    {marker.count} cases
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-500">
              Country heatmap markers will appear as application destinations are returned by the backend.
            </div>
          )}
        </div>
      </div>
    </SectionCard>
  );
}

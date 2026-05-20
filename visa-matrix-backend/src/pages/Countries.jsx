import { useEffect, useState } from "react";
import { getCountries } from "../services/api";

const matchesSearch = (item, searchQuery) =>
  !searchQuery ||
  JSON.stringify(item).toLowerCase().includes(searchQuery.toLowerCase());

export default function Countries({ searchQuery }) {
  const [countries, setCountries] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [source, setSource] = useState("mock");

  useEffect(() => {
    let active = true;

    const loadCountries = async () => {
      const result = await getCountries();

      if (!active) {
        return;
      }

      setCountries(result.items);
      setSource(result.source);
    };

    loadCountries();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedId && countries[0]) {
      setSelectedId(countries[0].id);
    }
  }, [countries, selectedId]);

  const visibleCountries = countries.filter((item) => matchesSearch(item, searchQuery));
  const selectedCountry =
    visibleCountries.find((country) => country.id === selectedId) || visibleCountries[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="section-label">Countries Module</div>
          <h2 className="page-title mt-2">Visa destinations and rule packs</h2>
          <p className="page-subtitle mt-2 max-w-3xl">
            Compare country queues, visa types, and requirement stacks before routing
            a case into processing.
          </p>
        </div>
        <div
          className={[
            "status-pill border",
            source === "live"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-amber-500/30 bg-amber-500/10 text-amber-300",
          ].join(" ")}
        >
          {source === "live" ? "Live country catalog" : "Fallback country catalog"}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-5">
          <section className="card-panel">
            <div className="card-header">
              <div>
                <h3 className="text-lg font-semibold text-white">Country list</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Select a destination to inspect visa types and requirements.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {visibleCountries.map((country) => (
                <button
                  key={country.id}
                  type="button"
                  className={[
                    "w-full rounded-2xl border p-4 text-left transition",
                    selectedCountry?.id === country.id
                      ? "border-blue-500/30 bg-blue-500/10"
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-700",
                  ].join(" ")}
                  onClick={() => setSelectedId(country.id)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-white">{country.name}</div>
                      <div className="mt-1 text-sm text-slate-400">{country.region}</div>
                    </div>
                    <span className="status-pill border-slate-700 bg-slate-950/80 text-slate-300">
                      {country.processingTime}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3 text-sm">
                    <span className="text-slate-400">Queue: {country.queue}</span>
                    <span className="text-emerald-300">{country.successRate}% success</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="col-span-12 xl:col-span-7 space-y-6">
          <section className="card-panel">
            <div className="card-header">
              <div>
                <h3 className="text-lg font-semibold text-white">
                  {selectedCountry?.name || "No country selected"}
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Processing time: {selectedCountry?.processingTime || "-"} | Visa
                  required: {selectedCountry?.visaRequired || "-"}
                </p>
              </div>
              <div className="status-pill border-blue-500/30 bg-blue-500/10 text-blue-300">
                {selectedCountry?.queue || "Queue Unknown"}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {(selectedCountry?.visaTypes || []).map((visaType) => (
                <div
                  key={visaType}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm font-medium text-slate-200"
                >
                  {visaType}
                </div>
              ))}
            </div>
          </section>

          <section className="card-panel">
            <div className="card-header">
              <div>
                <h3 className="text-lg font-semibold text-white">Visa requirements</h3>
                <p className="mt-1 text-sm text-slate-400">
                  Core requirements the case team should validate before submission.
                </p>
              </div>
            </div>
            <div className="grid gap-3">
              {(selectedCountry?.requirements || []).map((requirement) => (
                <div
                  key={requirement}
                  className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-200"
                >
                  {requirement}
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

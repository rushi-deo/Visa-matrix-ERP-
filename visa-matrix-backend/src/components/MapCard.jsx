import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";

const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

export default function MapCard({
  title = "Global Activity",
  subtitle,
  markers = [],
}) {
  return (
    <section className="card-panel h-full">
      <div className="card-header">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="mt-1 text-sm text-slate-400">
            {subtitle || "Active visa processing pressure across intake regions."}
          </p>
        </div>
        <div className="status-pill border-blue-500/30 bg-blue-500/10 text-blue-300">
          <span className="h-2 w-2 rounded-full bg-blue-400" />
          Global sync
        </div>
      </div>

      <div className="h-[340px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70">
        <ComposableMap
          projectionConfig={{ scale: 150 }}
          style={{ width: "100%", height: "100%" }}
        >
          <ZoomableGroup center={[10, 18]} zoom={1}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#172554"
                    stroke="#334155"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#1d4ed8", outline: "none" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {markers.map((marker) => (
              <Marker key={marker.name} coordinates={marker.coordinates}>
                <circle
                  fill="#38bdf8"
                  fillOpacity={0.85}
                  r={Math.max(5, marker.volume / 3)}
                  stroke="#dbeafe"
                  strokeWidth={1.5}
                />
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {markers.map((marker) => (
          <div
            key={marker.name}
            className="rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-white">{marker.name}</div>
                <div className="text-sm text-slate-400">{marker.activity}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-cyan-300">{marker.volume}</div>
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  cases
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

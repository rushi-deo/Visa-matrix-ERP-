import logo from "../../assets/logo.png";

type AppLogoProps = {
  compact?: boolean;
};

export default function AppLogo({ compact = false }: AppLogoProps) {
  return (
    <div className="flex items-center gap-3">
      <img
        src={logo}
        alt="Visa Matrix logo"
        className="h-11 w-11 rounded-2xl border border-white/15 bg-white/10 object-cover p-1 shadow-lg shadow-slate-950/20"
      />
      {!compact ? (
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-200">
            Visa ERP
          </p>
          <p className="text-lg font-semibold text-white">Visa Matrix</p>
        </div>
      ) : null}
    </div>
  );
}

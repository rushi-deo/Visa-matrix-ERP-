const inputClassName =
  "mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20";

export default function Form({
  title,
  description,
  fields,
  values,
  onChange,
  onSubmit,
  submitLabel = "Save",
  submitDisabled = false,
  footerNote,
}) {
  return (
    <form className="card-panel" onSubmit={onSubmit}>
      <div className="card-header">
        <div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          {description ? <p className="mt-1 text-sm text-slate-400">{description}</p> : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <label
            key={field.name}
            className={field.fullWidth ? "md:col-span-2" : undefined}
          >
            <span className="text-sm font-medium text-slate-300">{field.label}</span>
            {field.type === "select" ? (
              <select
                className={inputClassName}
                name={field.name}
                value={values[field.name] || ""}
                onChange={(event) => onChange(field.name, event.target.value)}
              >
                {field.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                className={`${inputClassName} min-h-[110px] resize-y`}
                name={field.name}
                placeholder={field.placeholder}
                value={values[field.name] || ""}
                onChange={(event) => onChange(field.name, event.target.value)}
              />
            ) : (
              <input
                className={inputClassName}
                name={field.name}
                type={field.type || "text"}
                placeholder={field.placeholder}
                value={values[field.name] || ""}
                onChange={(event) => onChange(field.name, event.target.value)}
              />
            )}
          </label>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">{footerNote}</p>
        <button
          className="rounded-2xl bg-blue-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitDisabled}
          type="submit"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

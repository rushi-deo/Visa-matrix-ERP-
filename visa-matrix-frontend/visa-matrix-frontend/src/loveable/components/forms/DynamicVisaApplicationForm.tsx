import * as React from "react";
import { Check, ChevronLeft, ChevronRight, FileUp, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Option = string | { label?: string; value?: string };
type VisaField = {
  id: string;
  label?: string;
  type?: string;
  required?: boolean;
  help_text?: string;
  helpText?: string;
  options?: Option[];
  condition?: Record<string, unknown>;
  conditional?: Record<string, unknown>;
  visible_if?: Record<string, unknown>;
};
type VisaSection = { id?: string; title?: string; description?: string; fields?: VisaField[] };
type FormConfig = {
  name?: string;
  country_name?: string;
  visa_type_name?: string;
  form_schema?: { sections?: VisaSection[] };
};

const optionValue = (option: Option) => typeof option === "string" ? option : String(option.value ?? option.label ?? "");
const optionLabel = (option: Option) => typeof option === "string" ? option : String(option.label ?? option.value ?? "");
const fieldType = (field: VisaField) => String(field.type ?? "text").toLowerCase();

const getCondition = (field: VisaField) => field.visible_if ?? field.conditional ?? field.condition ?? null;

const isVisible = (field: VisaField, values: Record<string, unknown>) => {
  const condition = getCondition(field);
  if (!condition) return true;
  const dependency = String(condition.field ?? condition.field_id ?? condition.depends_on ?? "");
  if (!dependency) return true;
  const actual = values[dependency];
  const expected = condition.equals ?? condition.value ?? condition.is;
  if (Array.isArray(expected)) return expected.map(String).includes(String(actual));
  if (typeof expected === "boolean") return Boolean(actual) === expected;
  if (expected !== undefined) return String(actual ?? "") === String(expected);
  const rule = String(condition.condition ?? "").toLowerCase();
  if (rule.includes("not empty")) return Boolean(actual);
  if (rule.includes("other than null")) return actual !== null && actual !== undefined && actual !== "";
  if (rule.includes("minor") || rule.includes("yes")) return Boolean(actual);
  return Boolean(actual);
};

const normalizeInitialValues = (sections: VisaSection[]) => sections.reduce<Record<string, unknown>>((values, section) => {
  (section.fields ?? []).forEach((field) => {
    values[field.id] = fieldType(field) === "checkbox" || fieldType(field) === "boolean" ? false : "";
  });
  return values;
}, {});

function FieldControl({ field, value, onChange }: { field: VisaField; value: unknown; onChange: (value: unknown) => void }) {
  const type = fieldType(field);
  const options = Array.isArray(field.options) ? field.options : [];
  const hasOptions = options.length > 1;
  const common = {
    id: field.id,
    name: field.id,
    value: String(value ?? ""),
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => onChange(event.target.value),
  };

  if (type === "checkbox") {
    return <label className="flex items-center gap-3 rounded-lg border border-border px-3 py-3 text-sm"><input type="checkbox" checked={Boolean(value)} onChange={(event) => onChange(event.target.checked)} className="size-4 accent-primary" />{field.label}</label>;
  }
  if (type === "boolean") {
    return <div className="flex flex-wrap gap-3">{(hasOptions ? options : ["Yes", "No"]).map((option) => <label key={optionValue(option)} className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm"><input type="radio" name={field.id} checked={String(value ?? "") === optionValue(option)} onChange={() => onChange(optionValue(option))} className="accent-primary" />{optionLabel(option)}</label>)}</div>;
  }
  if (type === "radio") {
    return <div className="flex flex-wrap gap-3">{options.map((option) => <label key={optionValue(option)} className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm"><input type="radio" name={field.id} checked={String(value ?? "") === optionValue(option)} onChange={() => onChange(optionValue(option))} className="accent-primary" />{optionLabel(option)}</label>)}</div>;
  }
  if (type === "file") {
    return <label htmlFor={field.id} className="flex min-h-24 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 text-sm text-muted-foreground hover:bg-muted/60"><FileUp className="size-4" />{value instanceof File ? value.name : "Choose a file"}<input id={field.id} name={field.id} type="file" onChange={(event) => onChange(event.target.files?.[0] ?? null)} className="sr-only" /></label>;
  }
  if (type === "textarea") return <Textarea {...common} value={String(value ?? "")} rows={4} />;
  if (type === "select" || hasOptions) return <select {...common} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"><option value="">Select an option</option>{options.map((option) => <option key={optionValue(option)} value={optionValue(option)}>{optionLabel(option)}</option>)}</select>;
  const htmlType = ["number", "email", "date", "tel"].includes(type) ? type : "text";
  return <Input {...common} type={htmlType} />;
}

export function DynamicVisaApplicationForm({ config, countryName, visaTypeName }: { config: FormConfig; countryName?: string; visaTypeName?: string }) {
  const sections = config.form_schema?.sections ?? [];
  const draftKey = `visa-matrix:draft:${countryName ?? "country"}:${visaTypeName ?? "visa"}`;
  const [step, setStep] = React.useState(0);
  const [reviewing, setReviewing] = React.useState(false);
  const [values, setValues] = React.useState<Record<string, unknown>>(() => normalizeInitialValues(sections));
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const section = sections[step];

  const updateValue = (id: string, value: unknown) => {
    setValues((current) => ({ ...current, [id]: value }));
    setErrors((current) => ({ ...current, [id]: "" }));
  };
  const validateSection = () => {
    const nextErrors: Record<string, string> = {};
    (section?.fields ?? []).filter((field) => isVisible(field, values)).forEach((field) => {
      const value = values[field.id];
      if (field.required && (value === undefined || value === null || value === "" || value === false)) nextErrors[field.id] = "This field is required.";
    });
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };
  const saveDraft = () => {
    window.localStorage.setItem(draftKey, JSON.stringify(values, (_, value) => value instanceof File ? { name: value.name, type: value.type } : value));
  };

  if (reviewing) return <ReviewPanel sections={sections} values={values} onBack={() => setReviewing(false)} onSave={saveDraft} />;

  return <div className="space-y-6">
    <div className="overflow-x-auto pb-1"><div className="flex min-w-max items-center justify-center gap-2 px-2">
      {sections.map((item, index) => <React.Fragment key={item.id ?? index}><button type="button" onClick={() => index < step && setStep(index)} className="flex items-center gap-2" aria-current={index === step ? "step" : undefined}><span className={cn("grid size-9 place-items-center rounded-full border text-sm font-semibold", index < step ? "border-emerald-600 bg-emerald-600 text-white" : index === step ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground")}>{index < step ? <Check className="size-4" /> : index + 1}</span><span className={cn("text-sm", index === step ? "font-semibold text-foreground" : "text-muted-foreground")}>{item.title ?? `Section ${index + 1}`}</span></button>{index < sections.length - 1 && <span className={cn("h-px w-8", index < step ? "bg-emerald-600" : "bg-border")} />}</React.Fragment>)}
    </div></div>
    <Card className="border-border/80 shadow-sm"><CardHeader className="border-b border-border/70 pb-5"><div className="flex items-start justify-between gap-4"><div><CardTitle className="text-xl">{section?.title ?? "Application details"}</CardTitle><CardDescription className="mt-1">{section?.description ?? "Complete the information below to continue your application."}</CardDescription></div><span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Step {step + 1} of {sections.length}</span></div></CardHeader><CardContent className="space-y-5 pt-6">
      {(section?.fields ?? []).filter((field) => isVisible(field, values)).map((field) => <div key={field.id} className="space-y-2"><label htmlFor={field.id} className="text-sm font-medium text-foreground">{field.label ?? field.id}{field.required && <span className="ml-1 text-destructive">*</span>}</label>{(field.help_text || field.helpText) && <p className="text-xs text-muted-foreground">{field.help_text || field.helpText}</p>}<FieldControl field={field} value={values[field.id]} onChange={(value) => updateValue(field.id, value)} />{errors[field.id] && <p className="text-xs text-destructive">{errors[field.id]}</p>}</div>)}
      <div className="flex flex-col-reverse gap-3 border-t border-border/70 pt-5 sm:flex-row sm:items-center sm:justify-between"><Button type="button" variant="outline" onClick={() => setStep((current) => Math.max(0, current - 1))} disabled={step === 0}><ChevronLeft className="size-4" />Previous</Button><div className="flex flex-col gap-2 sm:flex-row"><Button type="button" variant="ghost" onClick={saveDraft}><Save className="size-4" />Save Draft</Button>{step < sections.length - 1 ? <Button type="button" onClick={() => validateSection() && setStep((current) => current + 1)}>Next<ChevronRight className="size-4" /></Button> : <Button type="button" onClick={() => validateSection() && setReviewing(true)}>Review &amp; Submit<ChevronRight className="size-4" /></Button>}</div></div>
    </CardContent></Card>
  </div>;
}

function ReviewPanel({ sections, values, onBack, onSave }: { sections: VisaSection[]; values: Record<string, unknown>; onBack: () => void; onSave: () => void }) {
  return <Card className="border-border/80 shadow-sm"><CardHeader><CardTitle>Review application</CardTitle><CardDescription>Check your answers before submitting.</CardDescription></CardHeader><CardContent className="space-y-6">{sections.map((section) => <section key={section.id} className="space-y-3"><h3 className="font-semibold">{section.title}</h3><dl className="grid gap-3 sm:grid-cols-2">{(section.fields ?? []).map((field) => <div key={field.id} className="rounded-lg bg-muted/40 px-3 py-2"><dt className="text-xs text-muted-foreground">{field.label ?? field.id}</dt><dd className="mt-1 break-words text-sm">{values[field.id] instanceof File ? (values[field.id] as File).name : String(values[field.id] ?? "Not provided")}</dd></div>)}</dl></section>)}<div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-between"><Button type="button" variant="outline" onClick={onBack}><ChevronLeft className="size-4" />Back to edit</Button><div className="flex gap-2"><Button type="button" variant="ghost" onClick={onSave}><Save className="size-4" />Save Draft</Button><Button type="button">Submit application</Button></div></div></CardContent></Card>;
}

import SectionCard from "../components/common/SectionCard";

const settingsGroups = [
  {
    title: "API environment",
    description: "Configure API base URLs, fallback hosts, and integration endpoints.",
  },
  {
    title: "Notification policy",
    description: "Control how operational alerts and customer notifications are delivered.",
  },
  {
    title: "Security controls",
    description: "Review token handling, RBAC coverage, and operator access defaults.",
  },
];

export default function Settings() {
  return (
    <SectionCard
      title="Settings"
      description="Platform-wide configuration for integration, communication, and security defaults."
    >
      <div className="grid gap-4 md:grid-cols-3">
        {settingsGroups.map((group) => (
          <article
            key={group.title}
            className="rounded-3xl border border-slate-200 bg-slate-50 p-5"
          >
            <h2 className="text-lg font-semibold text-slate-950">{group.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {group.description}
            </p>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}

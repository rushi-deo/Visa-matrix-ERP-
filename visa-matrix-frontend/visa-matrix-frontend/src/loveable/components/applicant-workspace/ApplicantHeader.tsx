import { StatusBadge } from "@/components/common/StatusBadge";

interface ApplicantHeaderProps {
  applicant: any;
}

const displayValue = (value: unknown) =>
  value === null || value === undefined || value === "" ? "-" : String(value);

export function ApplicantHeader({ applicant }: ApplicantHeaderProps) {
  const fields = [
    ["Application ID", applicant.applicationCode || applicant.id],
    ["Country", applicant.destinationCountry],
    ["Visa Type", applicant.visaType],
    ["Assigned Employee", applicant.assignedEmployee],
    ["Created Date", applicant.createdAt],
  ];

  return (
    <div className="border-b bg-card px-6 py-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Applicant</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight">
            {displayValue(applicant.customerName)}
          </h3>
          <div className="mt-3">
            <StatusBadge value={displayValue(applicant.status)} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:min-w-[28rem] lg:grid-cols-3">
          {fields.map(([label, value]) => (
            <div key={label}>
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
              <p className="mt-1 text-sm font-medium">{displayValue(value)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

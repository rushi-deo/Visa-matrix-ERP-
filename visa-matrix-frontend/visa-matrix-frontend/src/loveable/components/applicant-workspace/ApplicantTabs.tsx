import * as React from "react";
import { ApplicantFormResponses } from "./ApplicantFormResponses";
import { ApplicantDocuments } from "./ApplicantDocuments";
import { ApplicantTimeline } from "./ApplicantTimeline";
import { ApplicantPayments } from "./ApplicantPayments";
import { ApplicantNotes } from "./ApplicantNotes";
import { ApplicantActivity } from "./ApplicantActivity";

interface ApplicantTabsProps {
  applicant: any;
  loading: boolean;
  applicationId: string;
  error?: string | null;
}

export function ApplicantTabs({ applicant, loading, applicationId, error }: ApplicantTabsProps) {
  const [activeTab, setActiveTab] = React.useState("overview");

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex shrink-0 gap-1 border-b px-4 pt-2">
        {[{ id: "overview", label: "Overview" }, { id: "form-responses", label: "Form Responses" }, { id: "documents", label: "Documents" }, { id: "timeline", label: "Timeline" }, { id: "payments", label: "Payments" }, { id: "notes", label: "Notes" }, { id: "activity", label: "Activity" }].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${activeTab === tab.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            onClick={() => setActiveTab(tab.id)}
            aria-selected={activeTab === tab.id}
            role="tab"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-6" role="tabpanel">
        {activeTab === "form-responses" ? <ApplicantFormResponses applicant={applicant} loading={loading} /> : activeTab === "documents" ? <ApplicantDocuments applicationId={applicationId} /> : activeTab === "timeline" ? <ApplicantTimeline applicant={applicant} loading={loading} /> : activeTab === "payments" ? <ApplicantPayments applicant={applicant} applicationId={applicationId} /> : activeTab === "notes" ? <ApplicantNotes applicant={applicant} loading={loading} /> : activeTab === "activity" ? <ApplicantActivity applicant={applicant} loading={loading} error={error} /> : <p className="text-sm text-muted-foreground">Select Form Responses, Documents, Timeline, Payments, Notes, or Activity to view application details.</p>}
      </div>
    </div>
  );
}

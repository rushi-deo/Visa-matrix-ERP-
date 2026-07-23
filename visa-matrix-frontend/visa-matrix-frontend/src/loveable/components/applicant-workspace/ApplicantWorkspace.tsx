import { WorkspaceToolbar } from "./WorkspaceToolbar";
import { ApplicantHeader } from "./ApplicantHeader";
import { useApplicant } from "./hooks/useApplicant";
import { ApplicantTabs } from "./ApplicantTabs";

interface ApplicantWorkspaceProps {
  applicationId: string | null;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  onClose: () => void;
}

export function ApplicantWorkspace({
  applicationId,
  isFullScreen,
  onToggleFullScreen,
  onClose,
}: ApplicantWorkspaceProps) {
  const { applicant, loading, error } = useApplicant(applicationId);

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-background">
      <WorkspaceToolbar
        isFullScreen={isFullScreen}
        onToggleFullScreen={onToggleFullScreen}
        onClose={onClose}
      />
      {applicant ? <ApplicantHeader applicant={applicant} /> : null}
      {applicant ? (
        <ApplicantTabs key={applicationId ?? applicant.id} applicant={applicant} loading={loading} applicationId={applicationId ?? applicant.id} error={error} />
      ) : (
        <div className="flex min-h-0 flex-1 items-center justify-center p-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading application...</p>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Select an application to view its details.
            </p>
          )}
        </div>
      )}
    </section>
  );
}

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
  if (!applicationId) {
    return (
      <section className="flex min-h-0 flex-1 flex-col bg-background">
        <WorkspaceToolbar isFullScreen={isFullScreen} onToggleFullScreen={onToggleFullScreen} onClose={onClose} />
        <div className="flex min-h-0 flex-1 items-center justify-center p-6">
          <p className="text-sm text-muted-foreground">Select an application to view its details.</p>
        </div>
      </section>
    );
  }

  return <ApplicantWorkspaceForApplication key={applicationId} {...{ applicationId, isFullScreen, onToggleFullScreen, onClose }} />;
}

function ApplicantWorkspaceForApplication({ applicationId, isFullScreen, onToggleFullScreen, onClose }: ApplicantWorkspaceProps & { applicationId: string }) {
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
        <ApplicantTabs key={applicationId} applicant={applicant} loading={loading} applicationId={applicationId} error={error} />
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

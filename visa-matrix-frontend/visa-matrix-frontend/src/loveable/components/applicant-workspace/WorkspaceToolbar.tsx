import { Maximize2, Minimize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkspaceToolbarProps {
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
  onClose: () => void;
}

export function WorkspaceToolbar({
  isFullScreen,
  onToggleFullScreen,
  onClose,
}: WorkspaceToolbarProps) {
  return (
    <div className="flex items-center justify-between border-b px-4 py-3">
      <div>
        <h2 className="text-base font-semibold">Applicant Workspace</h2>
        <p className="text-xs text-muted-foreground">
          Review application details and next steps.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToggleFullScreen}
          aria-pressed={isFullScreen}
        >
          {isFullScreen ? <Minimize2 /> : <Maximize2 />}
          {isFullScreen ? "Exit Full Screen" : "Full Screen"}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={onClose}>
          <X />
          Close
        </Button>
      </div>
    </div>
  );
}

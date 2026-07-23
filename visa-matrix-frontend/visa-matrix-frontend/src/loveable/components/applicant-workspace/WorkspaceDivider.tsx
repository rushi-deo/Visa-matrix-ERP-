import * as React from "react";
import { GripVertical } from "lucide-react";

interface WorkspaceDividerProps {
  onDrag: (deltaX: number) => void;
}

export function WorkspaceDivider({ onDrag }: WorkspaceDividerProps) {
  const lastX = React.useRef<number | null>(null);

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    lastX.current = event.clientX;
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (lastX.current === null) return;
    onDrag(event.clientX - lastX.current);
    lastX.current = event.clientX;
  };

  const stopDragging = () => {
    lastX.current = null;
  };

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize applications and applicant workspace panels"
      className="group flex w-2 shrink-0 cursor-col-resize items-center justify-center border-x bg-muted/30 hover:bg-muted"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDragging}
      onPointerCancel={stopDragging}
    >
      <GripVertical className="size-4 text-muted-foreground opacity-60 group-hover:opacity-100" />
    </div>
  );
}

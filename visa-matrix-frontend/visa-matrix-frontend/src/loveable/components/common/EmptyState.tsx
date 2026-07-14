import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}
export function EmptyState({ icon: Icon = Inbox, title, description, actionLabel, onAction }: Props) {
  return (
    <div className="border border-dashed rounded-lg py-16 px-6 grid place-items-center text-center">
      <div className="size-12 rounded-full bg-muted grid place-items-center mb-3">
        <Icon className="size-6 text-muted-foreground" />
      </div>
      <h3 className="font-medium">{title}</h3>
      {description && <p className="text-sm text-muted-foreground mt-1 max-w-md">{description}</p>}
      {actionLabel && <Button onClick={onAction} className="mt-4">{actionLabel}</Button>}
    </div>
  );
}

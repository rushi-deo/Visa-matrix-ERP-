import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type ApplicationProfileModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ApplicationProfileModal({
  open,
  onOpenChange,
}: ApplicationProfileModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-[90vw] h-[90vh] overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="text-2xl font-semibold">
            Application Profile
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">
            🚀 Application Profile Modal is Ready
            <br />
            <span className="text-sm">
              We'll build this section by section.
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
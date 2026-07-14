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
          <div className="grid grid-cols-12 gap-6">

  <div className="col-span-4">
    <div className="rounded-lg border bg-white p-5">
      <h2 className="text-lg font-semibold">Applicant Information</h2>

      <div className="mt-5 space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">Applicant</p>
          <p className="font-medium">Priya Verma</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Application ID</p>
          <p className="font-medium">VM-20240</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Country</p>
          <p className="font-medium">United Kingdom</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Visa Type</p>
          <p className="font-medium">Student Visa</p>
        </div>
      </div>
    </div>
  </div>

  <div className="col-span-8">
    <div className="rounded-lg border bg-white p-5">
      <h2 className="text-lg font-semibold">
        Application Overview
      </h2>

      <div className="mt-6">
        Content will go here...
      </div>
    </div>
  </div>

</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
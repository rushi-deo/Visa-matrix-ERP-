import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, Eye, Download } from "lucide-react";
import { documents } from "@/lib/mock-data";
import { StatusBadge } from "@/components/common/StatusBadge";
export const Route = createFileRoute("/_app/documents")({ component: () => (
  <>
    <PageHeader title="Document Center" description="Upload, verify and track applicant documents." actions={<Button><UploadCloud className="size-4 mr-2" />Upload</Button>} />
    <Card className="mb-6"><CardContent className="p-10 border-dashed border-2 border-border rounded-lg text-center bg-muted/30">
      <UploadCloud className="size-10 mx-auto text-muted-foreground mb-2" />
      <p className="font-medium">Drag and drop files here</p>
      <p className="text-sm text-muted-foreground">PDF, JPG, PNG up to 25MB</p>
      <Button variant="outline" className="mt-3">Browse files</Button>
    </CardContent></Card>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {documents.map((d) => (
        <Card key={d.id}><CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="size-10 rounded-md bg-primary/10 text-primary grid place-items-center"><FileText className="size-5" /></div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{d.name}</p>
              <p className="text-xs text-muted-foreground">{d.owner} · {d.size}</p>
            </div>
            <StatusBadge value={d.status} />
          </div>
          <div className="flex gap-2 mt-3"><Button size="sm" variant="outline" className="flex-1"><Eye className="size-3.5 mr-1" />Preview</Button><Button size="sm" variant="outline"><Download className="size-3.5" /></Button></div>
        </CardContent></Card>
      ))}
    </div>
  </>
) });

import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadCloud, FileText, Eye, Download } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { fetchDocuments } from "@erp/services/documents.service";

export const Route = createFileRoute("/_app/documents")({
  component: Page,
});

function Page() {
  const [documents, setDocuments] = React.useState<
    Array<{ id: string; name: string; owner: string; size: string; status: string }>
  >([]);

  React.useEffect(() => {
    let mounted = true;
    fetchDocuments()
      .then((rows) => {
        if (!mounted) return;
        setDocuments(
          rows.map((row) => ({
            id: row.id,
            name: row.fileName ?? row.documentName ?? "Document",
            owner: row.uploadedBy ?? "Operations Team",
            size: row.fileSize ?? "",
            status: row.status ?? "Pending",
          })),
        );
      })
      .catch(() => {
        if (mounted) setDocuments([]);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      <PageHeader
        title="Document Center"
        description="Upload, verify and track applicant documents."
        actions={
          <Button>
            <UploadCloud className="size-4 mr-2" />
            Upload
          </Button>
        }
      />
      <Card className="mb-6">
        <CardContent className="p-10 border-dashed border-2 border-border rounded-lg text-center bg-muted/30">
          <UploadCloud className="size-10 mx-auto text-muted-foreground mb-2" />
          <p className="font-medium">Drag and drop files here</p>
          <p className="text-sm text-muted-foreground">PDF, JPG, PNG up to 25MB</p>
          <Button variant="outline" className="mt-3">
            Browse files
          </Button>
        </CardContent>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {documents.map((d) => (
          <Card key={d.id}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.owner} · {d.size}
                  </p>
                </div>
                <StatusBadge value={d.status} />
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Eye className="size-3.5 mr-1" />
                  Preview
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

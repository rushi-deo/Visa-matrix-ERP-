import * as React from "react";
import { Download, Eye, FileText, Loader2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StatusBadge } from "@/components/common/StatusBadge";
import { toast } from "sonner";
import { fallbackChecklistCatalog, fetchDocuments, uploadDocuments } from "@erp/services/documents.service";
import { isUploadTypeSupported, supportedUploadTypes } from "@erp/services/erpService";

interface ApplicantDocumentsProps {
  applicationId: string;
}

const valueOrDash = (value: unknown) => value === null || value === undefined || value === "" ? "-" : String(value);
const getDocumentUrl = (document: any) => document.url ?? document.fileUrl ?? document.file_url ?? document.publicUrl ?? document.public_url ?? document.downloadUrl ?? document.download_url ?? null;
const getCategory = (document: any) => document.category ?? document.documentCategory ?? document.document_category ?? "Other";

export function ApplicantDocuments({ applicationId }: ApplicantDocumentsProps) {
  const [documents, setDocuments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [listError, setListError] = React.useState<string | null>(null);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [category, setCategory] = React.useState(String(fallbackChecklistCatalog?.[0] ?? "Passport"));
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const loadDocuments = React.useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setListError(null);
    try {
      const result = await fetchDocuments({ includeMeta: true });
      if (result?.error) throw result.error;
      const rows = Array.isArray(result?.data) ? result.data : [];
      setDocuments(rows.filter((document) => String(document.applicationId ?? document.application_id ?? "") === String(applicationId)));
    } catch (error: any) {
      setDocuments([]);
      setListError(error?.message ?? "Unable to load documents.");
      throw error;
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [applicationId]);

  React.useEffect(() => {
    loadDocuments().catch(() => undefined);
  }, [loadDocuments]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setUploadError(null);
    if (!file) return setSelectedFile(null);
    if (!isUploadTypeSupported(file.name)) {
      setSelectedFile(null);
      return setUploadError("Only PDF, JPG, PNG, and DOCX files are supported.");
    }
    if (file.size > 25 * 1024 * 1024) {
      setSelectedFile(null);
      return setUploadError("Files must be 25 MB or smaller.");
    }
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!category) return setUploadError("Select a document category.");
    if (!selectedFile) return setUploadError("Choose a file to upload.");
    setUploading(true);
    setUploadProgress(35);
    setUploadError(null);
    try {
      await uploadDocuments({ applicationId, documentName: category, uploadedBy: "Operations Team", files: [selectedFile] });
      setUploadProgress(100);
      await loadDocuments(false);
      toast.success("Document uploaded successfully.");
      setUploadOpen(false);
      setSelectedFile(null);
    } catch (error: any) {
      setUploadError(error?.message ?? "Unable to upload document.");
      toast.error(error?.message ?? "Unable to upload document.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const groupedDocuments = documents.reduce<Record<string, any[]>>((groups, document) => {
    const documentCategory = String(getCategory(document));
    (groups[documentCategory] ??= []).push(document);
    return groups;
  }, {});
  const categories = Array.isArray(fallbackChecklistCatalog) && fallbackChecklistCatalog.length > 0 ? fallbackChecklistCatalog : ["Passport"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div><h3 className="text-base font-semibold">Documents</h3><p className="text-sm text-muted-foreground">Uploaded documents for this application.</p></div>
        <Button type="button" onClick={() => { setUploadOpen(true); setUploadError(null); }}><UploadCloud className="size-4" />Upload Document</Button>
      </div>
      {loading ? <p className="text-sm text-muted-foreground">Loading documents...</p> : null}
      {listError ? <p className="text-sm text-destructive">{listError}</p> : null}
      {!loading && !listError && documents.length === 0 ? <p className="text-sm text-muted-foreground">No documents uploaded.</p> : null}
      {Object.entries(groupedDocuments).map(([documentCategory, categoryDocuments]) => (
        <section key={documentCategory} className="space-y-3"><h3 className="text-sm font-semibold">{documentCategory}</h3><div className="grid gap-3">
          {categoryDocuments.map((document) => {
            const url = getDocumentUrl(document);
            const fileName = document.fileName ?? document.file_name;
            const documentName = document.documentName ?? document.document_name ?? fileName ?? "Document";
            const documentType = document.documentType ?? document.document_type ?? document.type ?? document.fileType ?? "FILE";
            const status = document.status ?? document.verificationStatus ?? document.verification_status ?? "Uploaded";
            return <Card key={document.id}><CardHeader className="pb-3"><div className="flex items-start gap-3"><div className="grid size-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary"><FileText className="size-4" /></div><div className="min-w-0 flex-1"><CardTitle className="truncate text-sm">{valueOrDash(documentName)}</CardTitle><p className="mt-1 text-xs text-muted-foreground">{valueOrDash(fileName)}</p></div><StatusBadge value={valueOrDash(status)} /></div></CardHeader><CardContent className="space-y-3 pt-0"><div className="grid gap-3 text-sm sm:grid-cols-3"><div><p className="text-xs text-muted-foreground">Document Type</p><p className="mt-1 font-medium">{valueOrDash(documentType)}</p></div><div><p className="text-xs text-muted-foreground">Upload Date</p><p className="mt-1 font-medium">{valueOrDash(document.uploadDate ?? document.upload_date ?? document.uploaded_at)}</p></div><div><p className="text-xs text-muted-foreground">Status</p><p className="mt-1 font-medium">{valueOrDash(status)}</p></div></div><div className="flex gap-2 border-t pt-3">{url ? <Button asChild size="sm" variant="outline"><a href={url} target="_blank" rel="noreferrer"><Eye className="size-3.5" />View</a></Button> : <Button size="sm" variant="outline" disabled><Eye className="size-3.5" />View</Button>}{url ? <Button asChild size="sm" variant="outline"><a href={url} download={fileName || true}><Download className="size-3.5" />Download</a></Button> : <Button size="sm" variant="outline" disabled><Download className="size-3.5" />Download</Button>}</div></CardContent></Card>;
          })}
        </div></section>
      ))}
      <Dialog open={uploadOpen} onOpenChange={(open) => { if (!uploading) setUploadOpen(open); }}><DialogContent><DialogHeader><DialogTitle>Upload Document</DialogTitle><DialogDescription>Choose a category and upload a PDF, JPG, PNG, or DOCX file up to 25 MB.</DialogDescription></DialogHeader><div className="space-y-4"><div className="space-y-2"><label htmlFor="document-category" className="text-sm font-medium">Document Category</label><select id="document-category" value={category} onChange={(event) => setCategory(event.target.value)} disabled={uploading} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring">{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></div><div className="space-y-2"><label htmlFor="application-document" className="text-sm font-medium">File</label><input id="application-document" type="file" accept={supportedUploadTypes} onChange={handleFileChange} disabled={uploading} className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />{selectedFile ? <p className="text-xs text-muted-foreground">{selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)</p> : null}</div>{uploading ? <div className="space-y-2"><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary transition-all" style={{ width: `${uploadProgress}%` }} /></div><p className="text-xs text-muted-foreground">Uploading document...</p></div> : null}{uploadError ? <p className="text-sm text-destructive">{uploadError}</p> : null}</div><DialogFooter><Button type="button" variant="outline" onClick={() => setUploadOpen(false)} disabled={uploading}>Cancel</Button><Button type="button" onClick={handleUpload} disabled={uploading}>{uploading ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}{uploading ? "Uploading..." : "Upload"}</Button></DialogFooter></DialogContent></Dialog>
    </div>
  );
}

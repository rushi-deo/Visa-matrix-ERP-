import { useState } from "react";
import { useMutation } from "@tanstack/react-query";

import SectionCard from "../../components/common/SectionCard";
import { uploadDocument } from "../../services/documentsService";

export default function UploadDocumentForm() {
  const [applicationId, setApplicationId] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: uploadDocument,
    onSuccess: () => {
      setFeedback("Document uploaded successfully.");
      setError("");
      setApplicationId("");
      setDocumentName("");
      setFile(null);
    },
    onError: (mutationError) => {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : "Unable to upload document.";
      setFeedback("");
      setError(message);
    },
  });

  return (
    <SectionCard
      title="Upload documents"
      description="Send passport, photo, and supporting files to the protected backend upload endpoint."
    >
      <form
        className="grid gap-5 lg:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          setFeedback("");
          setError("");

          if (!file) {
            setError("Please select a file before uploading.");
            return;
          }

          mutation.mutate({
            applicationId,
            documentName,
            file,
          });
        }}
      >
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Application ID
          </span>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#1E5BB8] focus:bg-white"
            value={applicationId}
            onChange={(event) => setApplicationId(event.target.value)}
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            Document name
          </span>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#1E5BB8] focus:bg-white"
            value={documentName}
            onChange={(event) => setDocumentName(event.target.value)}
            placeholder="Passport, Photo, Bank Statement"
            required
          />
        </label>
        <label className="block lg:col-span-2">
          <span className="mb-2 block text-sm font-medium text-slate-700">
            File
          </span>
          <input
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition file:mr-4 file:rounded-xl file:border-0 file:bg-[#1E5BB8] file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white focus:border-[#1E5BB8] focus:bg-white"
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            required
          />
        </label>

        <div className="lg:col-span-2">
          {feedback ? (
            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {feedback}
            </div>
          ) : null}
          {error ? (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}
          <button
            type="submit"
            className="rounded-2xl bg-[#1E5BB8] px-5 py-3 text-sm font-semibold text-white"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Uploading..." : "Upload document"}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}

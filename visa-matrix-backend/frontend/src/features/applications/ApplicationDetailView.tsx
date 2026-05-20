import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";

import ErrorState from "../../components/common/ErrorState";
import LoadingState from "../../components/common/LoadingState";
import SectionCard from "../../components/common/SectionCard";
import StatusPill from "../../components/common/StatusPill";
import { fetchApplicationByReference } from "../../services/adminService";
import { formatCurrency, formatDateTime } from "../../utils/formatters";
import { normalizeApplicationDetail } from "../../utils/normalizers";

export default function ApplicationDetailView() {
  const { referenceNo = "" } = useParams();

  const query = useQuery({
    queryKey: ["application-detail", referenceNo],
    queryFn: () => fetchApplicationByReference(referenceNo),
    enabled: Boolean(referenceNo),
  });

  if (query.isLoading) {
    return <LoadingState label="Loading application detail..." />;
  }

  if (query.isError || !query.data) {
    const message =
      query.error instanceof Error
        ? query.error.message
        : "Unable to load application details.";
    return <ErrorState description={message} />;
  }

  const application = normalizeApplicationDetail(query.data);
  const paymentAmount = Number(application.payment?.amount || 0);
  const paymentCurrency = String(application.payment?.currency || "USD");

  return (
    <div className="space-y-6">
      <SectionCard
        title={application.client_name}
        description={`Reference ${application.reference_no} · ${application.country || "Destination pending"}`}
        action={
          <Link
            to="/applications"
            className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Back to applications
          </Link>
        }
      >
        <div className="grid gap-4 lg:grid-cols-4">
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Status
            </p>
            <div className="mt-3">
              <StatusPill value={application.status} />
            </div>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Visa type
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-900">
              {application.visa_type || "Not provided"}
            </p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Payment
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-900">
              {formatCurrency(paymentAmount, paymentCurrency)}
            </p>
          </div>
          <div className="rounded-3xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
              Submitted
            </p>
            <p className="mt-3 text-lg font-semibold text-slate-900">
              {formatDateTime(application.created_at)}
            </p>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <SectionCard
          title="Document package"
          description="Document metadata returned with the application case."
        >
          <div className="space-y-3">
            {application.documents?.length ? (
              application.documents.map((document, index) => (
                <div
                  key={`${document.document_name}-${index}`}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {document.document_name || "Unnamed document"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Uploaded {formatDateTime(String(document.uploaded_at || ""))}
                      </p>
                    </div>
                    {document.file_url ? (
                      <a
                        href={String(document.file_url)}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-[#1E5BB8]"
                      >
                        Open file
                      </a>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm leading-6 text-slate-500">
                No documents were returned with this case payload.
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Profile snapshot"
          description="Customer metadata and payment fields supplied by the backend."
        >
          <dl className="space-y-4">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Applicant
              </dt>
              <dd className="mt-2 text-sm text-slate-700">{application.client_name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Country
              </dt>
              <dd className="mt-2 text-sm text-slate-700">{application.country || "Unknown"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                Payment status
              </dt>
              <dd className="mt-2 text-sm text-slate-700">
                <StatusPill value={String(application.payment?.payment_status || application.payment_status || "Pending")} />
              </dd>
            </div>
          </dl>
        </SectionCard>
      </div>
    </div>
  );
}

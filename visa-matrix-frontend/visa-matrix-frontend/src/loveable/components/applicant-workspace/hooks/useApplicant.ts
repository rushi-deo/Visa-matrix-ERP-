import * as React from "react";
import { fetchApplicationById } from "@erp/services/application.service";
import { asApiRecord, getErrorMessage, type ApiRecord } from "@/lib/api-record";

export function useApplicant(applicationId: string) {
  const [applicant, setApplicant] = React.useState<ApiRecord | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    fetchApplicationById(applicationId)
      .then((data) => {
        if (mounted) setApplicant(asApiRecord(data));
      })
      .catch((error: unknown) => {
        if (mounted) {
          setApplicant(null);
          setError(getErrorMessage(error, "Unable to load application."));
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [applicationId]);

  return { applicant, loading, error };
}

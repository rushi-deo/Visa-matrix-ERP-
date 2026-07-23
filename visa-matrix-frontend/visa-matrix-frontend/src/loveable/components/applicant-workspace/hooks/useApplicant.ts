import * as React from "react";
import { fetchApplicationById } from "@erp/services/application.service";

export function useApplicant(applicationId: string | null) {
  const [applicant, setApplicant] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let mounted = true;

    if (!applicationId) {
      setApplicant(null);
      setError(null);
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    setApplicant(null);
    setLoading(true);
    setError(null);

    fetchApplicationById(applicationId)
      .then((data) => {
        if (mounted) setApplicant(data);
      })
      .catch((err) => {
        if (mounted) {
          setApplicant(null);
          setError(err?.message ?? String(err));
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

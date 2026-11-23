import { useEffect, useState } from "react";

export function useHrResource(fetcher, dependencies = []) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async (showLoading = true) => {
    if (showLoading) setLoading(true);

    try {
      const response = await fetcher();
      setData(response);
      setError("");
    } catch (loadError) {
      setError(loadError.message ?? "Unable to load HR resource.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // The request updates state only after the fetcher settles.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, error, loading, reload: () => load(true), setData };
}


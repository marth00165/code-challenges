import { useEffect, useState } from 'react';

// mock fetch from public/fares.json

/*
Made it a hook for reusability and separation of concerns.
In a larger app, this could be placed in a context provider for global access.
*/

export function useFares() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/fares.json');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err?.message ?? 'Failed to load fares');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { data, loading, error };
}

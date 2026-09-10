import { useCallback, useEffect, useState } from 'react';
import { accountApi } from '@/utils/api/account';

export function useLoginHistory() {
  const [logins, setLogins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await accountApi.getLoginHistory();
      setLogins(response.logins || []);
    } catch (apiError) {
      setError(apiError);
      setLogins([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { logins, isLoading, error };
}

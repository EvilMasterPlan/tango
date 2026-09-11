import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '@/utils/api/admin';

const EMPTY_DETAILS = { user: null, stats: { wordsDiscovered: 0, lessonsCompleted: 0 }, eventLogs: [] };

// Re-fetches whenever `userID` changes — the detail page (Admin/Spotlight/
// Detail/Page.jsx) stays mounted across a userID param change if the admin
// navigates from one spotlight result to another without going back
// through the search page first.
export function useAdminUserDetails(userID) {
  const [details, setDetails] = useState(EMPTY_DETAILS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminApi.getUserDetails(userID);
      setDetails(response || EMPTY_DETAILS);
    } catch (apiError) {
      setError(apiError);
      setDetails(EMPTY_DETAILS);
    } finally {
      setIsLoading(false);
    }
  }, [userID]);

  useEffect(() => {
    load();
  }, [load]);

  return { ...details, isLoading, error };
}

import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { IoSearchOutline } from 'react-icons/io5';
import { AdminSubpageHeader } from '@/pages/Admin/AdminSubpageHeader';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { adminApi } from '@/utils/api/admin';
import '@/pages/Admin/Admin.scss';

const SEARCH_DEBOUNCE_MS = 300;

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function UserCard({ user }) {
  return (
    <Link to={`/kansatsu/spotlight/${user.userID}`} className="admin-page__user-card">
      <div className="admin-page__user-card-header">
        <span className="admin-page__user-card-email">{user.email}</span>
        <span className="admin-page__user-card-plan">{user.plan || 'FREE'}</span>
      </div>
      {user.handle && <div className="admin-page__user-card-handle">@{user.handle}</div>}
      <div className="admin-page__user-card-id">{user.userID}</div>
      <div className="admin-page__user-card-joined">Joined {formatDate(user.createdAt)}</div>
    </Link>
  );
}

// A search-as-you-type lookup by UserID or email — clicking a result card
// goes to that account's own detail page (Admin/Spotlight/Detail/Page.jsx).
export function AdminSpotlightPage() {
  const [queryInput, setQueryInput] = useState('');
  const [users, setUsers] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  // Guards against an earlier, slower request's response clobbering a
  // later one's already-rendered results — same "only the most recent
  // request wins" reasoning as useWordProgress's own requestIDRef.
  const searchIDRef = useRef(0);

  const runSearch = useCallback(async (query) => {
    const searchID = ++searchIDRef.current;
    setIsSearching(true);
    setError(null);
    try {
      const response = await adminApi.searchUsers(query);
      if (searchID !== searchIDRef.current) return;
      setUsers(response.users || []);
    } catch (apiError) {
      if (searchID !== searchIDRef.current) return;
      setError(apiError);
      setUsers([]);
    } finally {
      if (searchID === searchIDRef.current) setIsSearching(false);
    }
  }, []);

  const debouncedSearch = useDebouncedCallback(runSearch, SEARCH_DEBOUNCE_MS);

  function handleQueryChange(event) {
    const value = event.target.value;
    setQueryInput(value);

    const trimmed = value.trim();
    if (!trimmed) {
      // Bumping searchIDRef here discards any still-in-flight/pending
      // request for a query the user has since cleared, so its response
      // can't repopulate results after the box has already gone empty.
      searchIDRef.current += 1;
      setUsers([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    debouncedSearch(trimmed);
  }

  return (
    <>
      <Helmet>
        <title>Tango Tanuki - Admin Spotlight</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="admin-page">
        <AdminSubpageHeader title="Spotlight" />
        <div className="admin-page__content">
          <div className="admin-page__search">
            <IoSearchOutline className="admin-page__search-icon" />
            <input
              type="text"
              className="admin-page__search-input"
              placeholder="UserID or Email"
              value={queryInput}
              onChange={handleQueryChange}
              autoComplete="off"
              spellCheck={false}
            />
          </div>

          <div className="admin-page__results">
            {error && <p className="admin-page__empty">Something went wrong searching users.</p>}
            {!error && !isSearching && queryInput.trim() && users.length === 0 && (
              <p className="admin-page__empty">No users found.</p>
            )}

            {users.length > 0 && (
              <div className="admin-page__user-grid">
                {users.map((user) => (
                  <UserCard user={user} key={user.userID} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

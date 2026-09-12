import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AdminSubpageHeader } from '@/pages/Admin/AdminSubpageHeader';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { useAdminSharpEdgesStats } from '@/hooks/useAdminSharpEdgesStats';
import '@/pages/Admin/Admin.scss';

const TIMEFRAME_OPTIONS = [
  { days: 7, label: 'Past 7 days' },
  { days: 14, label: 'Past 14 days' },
  { days: 30, label: 'Past 30 days' },
  { days: 90, label: 'Past 3 months' },
];
const DEFAULT_TIMEFRAME_DAYS = 30;

function TimeframeDropdown({ days, setDays }) {
  return (
    <label className="admin-page__timeframe">
      Timeframe
      <select
        className="admin-page__timeframe-select"
        value={days}
        onChange={(event) => setDays(Number(event.target.value))}
      >
        {TIMEFRAME_OPTIONS.map((option) => (
          <option key={option.days} value={option.days}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

// `word` is null when the row's VocabID has since been deleted from
// TANGO_Words — `wordID` (always present) is what's shown instead, so a
// stale row still reads as something rather than a blank cell.
function WordCell({ word, wordID }) {
  if (!word) {
    return <span className="admin-page__word-cell-deleted">Deleted word #{wordID}</span>;
  }

  return (
    <div className="admin-page__word-cell">
      <div className="admin-page__word-cell-word">
        {word.word}
        {word.reading && word.reading !== word.word && (
          <span className="admin-page__word-cell-reading"> ({word.reading})</span>
        )}
      </div>
      <div className="admin-page__word-cell-definition">{word.definition}</div>
    </div>
  );
}

// Shared by both ranked tables below — `rows` already comes back from the
// API sorted by incorrectCount descending. `renderExtraColumns` supplies
// whatever cells come between the Word column and the trailing
// Incorrect/Users pair (just the question type, for the combos table).
function SharpEdgesTable({ rows, extraHeader, renderExtraColumns, emptyMessage }) {
  if (rows.length === 0) {
    return <p className="admin-page__empty">{emptyMessage}</p>;
  }

  return (
    <div className="admin-page__table-wrap">
      <table className="admin-page__table">
        <thead>
          <tr>
            <th className="admin-page__table-numeric">#</th>
            <th>Word</th>
            {extraHeader && <th>{extraHeader}</th>}
            <th className="admin-page__table-numeric">Incorrect</th>
            <th className="admin-page__table-numeric">Users</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index}>
              <td className="admin-page__table-numeric">{index + 1}</td>
              <td className="admin-page__table-word">
                <WordCell word={row.word} wordID={row.wordID} />
              </td>
              {renderExtraColumns && renderExtraColumns(row)}
              <td className="admin-page__table-numeric">{row.incorrectCount.toLocaleString()}</td>
              <td className="admin-page__table-numeric">{row.uniqueUserCount.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminSharpEdgesPage() {
  const [days, setDays] = useState(DEFAULT_TIMEFRAME_DAYS);
  const { topIncorrectCombos, topIncorrectWords, isLoading, error } = useAdminSharpEdgesStats(days);
  const timeframeLabel = TIMEFRAME_OPTIONS.find((option) => option.days === days)?.label;

  return (
    <>
      <Helmet>
        <title>Tango Tanuki - Admin Sharp Edges</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="admin-page">
        <AdminSubpageHeader title="Sharp Edges" />
        <div className="admin-page__content">
          {error && <p className="admin-page__empty">Something went wrong loading Sharp Edges stats.</p>}

          {!error && (
            <div className="admin-page__detail">
              <TimeframeDropdown days={days} setDays={setDays} />

              <section className="admin-page__section">
                <h2 className="admin-page__section-title">Top Incorrect Word + Question Type Combos</h2>
                <p className="admin-page__section-subtitle">
                  Ranked by incorrect count, among combos last missed in the {timeframeLabel?.toLowerCase()}.
                  "Incorrect" is each combo's lifetime miss count, not just misses within the window — see the
                  admin API docs for why.
                </p>
                <SharpEdgesTable
                  rows={topIncorrectCombos}
                  extraHeader="Type"
                  renderExtraColumns={(row) => <td>{row.questionKind}</td>}
                  emptyMessage="No incorrect answers logged in this timeframe."
                />
              </section>

              <section className="admin-page__section">
                <h2 className="admin-page__section-title">Top Incorrect Words</h2>
                <p className="admin-page__section-subtitle">
                  Same ranking, collapsed across every question type per word — among words last missed in
                  the {timeframeLabel?.toLowerCase()}.
                </p>
                <SharpEdgesTable
                  rows={topIncorrectWords}
                  emptyMessage="No incorrect answers logged in this timeframe."
                />
              </section>

              <LoadingOverlay active={isLoading} />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

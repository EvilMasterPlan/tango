import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { IoArrowBack, IoCheckmarkCircle } from 'react-icons/io5';
import { cx } from '@/utils/cx';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { OverflowMenu } from '@/components/shared/OverflowMenu';
import { useAchievements } from '@/hooks/useAchievements';
import '@/pages/Achievements/Page.scss';

const TIER_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const tierNumeral = (tier) => TIER_NUMERALS[tier - 1] || String(tier);

// The API's tier names already carry a trailing roman numeral for tier 2+
// (e.g. "Dedicated Student II") — redundant now that the Rank chip shows
// that same numeral next to the name, so it's stripped for display only.
const TRAILING_NUMERAL = new RegExp(`\\s+(${TIER_NUMERALS.join('|')})$`);
const displayName = (name) => name.replace(TRAILING_NUMERAL, '');

// Picks the tier a channel's card should show (the lowest not-yet-completed
// one, or the last tier once every tier is completed) plus that tier's
// progress fraction — shared by AchievementsPage (to sort channels by
// closeness to completion) and ChannelCard (to render), so there's exactly
// one place that decides which tier is "active".
function getActiveTierProgress(current, tiers) {
  const sortedTiers = [...tiers].sort((a, b) => a.tier - b.tier);
  const activeTier = sortedTiers.find((tier) => !tier.completed) || sortedTiers[sortedTiers.length - 1];
  const progress = activeTier.target ? Math.min(current / activeTier.target, 1) : 0;
  return { activeTier, progress };
}

// One card per channel, not per tier — shows whichever tier still needs
// progress (the lowest not-yet-completed one), plus a "Rank" badge for
// that same tier: the rank currently being worked toward, not the last one
// finished, so a channel with no completed tiers yet still shows "Rank I"
// rather than no badge at all. Once every tier in the chain is completed,
// the last tier itself becomes the "active" one, so a maxed-out channel
// still shows something (a full bar and the completed checkmark) rather
// than rendering nothing.
function ChannelCard({ current, activeTier, progress }) {
  return (
    <div className={cx('achievement-card', activeTier.completed && 'achievement-card--completed')}>
      <div className="achievement-card__header">
        <div className="achievement-card__badge">Rank {tierNumeral(activeTier.tier)}</div>
        <h2 className="achievement-card__name">{displayName(activeTier.name)}</h2>
        {activeTier.completed && <IoCheckmarkCircle className="achievement-card__check" aria-label="Completed" />}
      </div>
      <p className="achievement-card__description">{activeTier.description}</p>
      <div className="achievement-card__progress-track">
        <div className="achievement-card__progress-fill" style={{ width: `${progress * 100}%` }} />
        <div className="achievement-card__progress-label">
          {Math.min(current, activeTier.target)} / {activeTier.target}
        </div>
      </div>
    </div>
  );
}

export function AchievementsPage() {
  const { achievements, isLoading } = useAchievements();

  // Closest-to-completion first, so the achievements a user is most likely
  // to finish next float to the top rather than being scattered wherever
  // the API happened to list their channel.
  const channels = Object.entries(achievements)
    .map(([channel, { current, tiers }]) => ({ channel, current, ...getActiveTierProgress(current, tiers) }))
    .sort((a, b) => b.progress - a.progress);

  return (
    <>
      <Helmet>
        <title>Achievements</title>
      </Helmet>
      <div className="achievements-page">
        <header className="achievements-page__header">
          <div className="achievements-page__nav">
            <Link to="/home" className="achievements-page__back" aria-label="Back to home">
              <IoArrowBack />
            </Link>
            <h1 className="achievements-page__title">Achievements</h1>
            <OverflowMenu currentPage="achievements" className="achievements-page__menu" />
          </div>
        </header>

        <div className="achievements-page__content">
          {!isLoading && channels.length === 0 && (
            <p className="achievements-page__empty">No achievements yet.</p>
          )}

          <div className="achievements-page__grid">
            {channels.map(({ channel, current, activeTier, progress }) => (
              <ChannelCard key={channel} current={current} activeTier={activeTier} progress={progress} />
            ))}
          </div>

          <LoadingOverlay active={isLoading} />
        </div>
      </div>
    </>
  );
}

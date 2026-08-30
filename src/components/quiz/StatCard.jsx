import { forwardRef } from 'react';
import { cx } from '@/utils/cx';
import './StatCard.scss';

// A small "name tag" card: a light frame with a dark label engraved across
// its (extra-thick) top band, wrapped around a dark inset window holding
// the actual value — same bordered/footed 3D treatment as the quiz's
// answer buttons (ChoiceButton, SpellingSlots, the word summary cards),
// pulled out on its own since QuizSummary repeats it four times.
//
// `variant` only colors the value text inside the dark window; the frame
// and label stay the same for every stat.
//
// Classes are prefixed `quiz-stat-card` rather than the plainer `stat-card`
// — App.scss already has its own unrelated `.stat-card` (the marketing
// page's Quick Stats section, with its own `:hover { transform: scale(...) }`)
// that would otherwise bleed into this component since CSS classes aren't
// scoped to a file.
// Forwards its ref to the root card element — the reward card uses this so
// QuizSummary can center confetti bursts on it (see coinConfetti.js).
export const StatCard = forwardRef(function StatCard({ label, value, variant = 'default' }, ref) {
  return (
    <div ref={ref} className="quiz-stat-card">
      <dt className="quiz-stat-card__label">{label}</dt>
      <dd className={cx('quiz-stat-card__value', variant !== 'default' && `quiz-stat-card__value--${variant}`)}>
        {value}
      </dd>
    </div>
  );
});

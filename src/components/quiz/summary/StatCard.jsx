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
//
// `pulseKey` is optional: when the reward card's value goes up, QuizSummary
// bumps it, and the `key` below forces React to mount a brand new overlay
// element each time rather than reusing one whose animation already ran —
// that's what makes the gold flash replay on every increase instead of
// only the first.
export function StatCard({ label, value, variant = 'default', pulseKey }) {
  return (
    <div className="quiz-stat-card">
      <dt className="quiz-stat-card__label">{label}</dt>
      <dd className={cx('quiz-stat-card__value', variant !== 'default' && `quiz-stat-card__value--${variant}`)}>
        {value}
        {pulseKey != null && <span key={pulseKey} className="quiz-stat-card__pulse" aria-hidden="true" />}
      </dd>
    </div>
  );
}

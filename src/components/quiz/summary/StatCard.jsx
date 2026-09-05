import { cx } from '@/utils/cx';
import './StatCard.scss';

// A small "name tag" card: a light frame with a dark label engraved across
// its (extra-thick) top band, wrapped around a dark inset window holding
// the actual value — same bordered/footed 3D treatment as the quiz's other
// pressable surfaces, pulled out on its own since QuizSummary repeats it
// four times.
//
// `variant` only colors the value text inside the dark window; the frame
// and label stay the same for every stat.
//
// Classes are prefixed `quiz-stat-card` rather than the plainer `stat-card`
// — another part of the app already has its own unrelated `.stat-card`
// class that would otherwise bleed into this component since CSS classes
// aren't scoped to a file.
//
// `pulseKey` is optional: when the reward card's value goes up, QuizSummary
// bumps it, and the `key` below forces React to mount a brand new overlay
// element each time, replaying the gold flash on every increase.
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

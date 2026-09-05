import { useEffect, useRef, useState } from 'react';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { CoinIcon } from '@/components/quiz/summary/CoinIcon';
import { MasteryPentagon } from '@/components/quiz/charts/MasteryPentagon';
import { NumberDial } from '@/components/quiz/summary/NumberDial';
import { StatCard } from '@/components/quiz/summary/StatCard';
import { FuriganaWord } from '@/components/quiz/vocabulary/VocabularyDisplay';
import { cx } from '@/utils/cx';
import './QuizSummary.scss';

// The intro auto-rotation's pacing: a flat delay between words.
const ROTATE_DELAY_MS = 220;

// How much accumulated wheel movement counts as "one notch" once manual
// scrolling is live — deliberately coarse so an idle trackpad twitch
// doesn't skip a word, but a real scroll gesture reliably does.
const WHEEL_STEP_THRESHOLD = 40;

// Zeni (銭) — this lesson's play-money reward. A flat amount just for
// finishing, plus a bonus per *correct* round on a word (so a word tested
// twice and gotten right both times is worth double one gotten right
// once), credited the moment that word first becomes "current" — during
// the intro rotation or, once that's done, by scrolling/arrowing to it.
// The scoring math lives server-side; this component just walks
// `scoring.scoringBreakdown` and animates it.

export function QuizSummary({ total, rounds, initialMasteryByWordID, scoring = { totalScore: 0, scoringBreakdown: [] } }) {
  // One row per unique word — lesson generation is currently guaranteed
  // not to repeat a word within a set, but may not always be (different
  // skill keys hitting the same word). A Map keyed by entry.id keeps each
  // id's first-seen position (so list order stays stable) while letting a
  // later occurrence's value win, which matters here: a later round's
  // `mastery` snapshot reflects every attempt recorded so far, including
  // any earlier round on the same word, so it's always the more
  // up-to-date one to show.
  const uniqueRounds = [...new Map(rounds.map((round) => [round.entry.id, round])).values()];
  const lastIndex = uniqueRounds.length - 1;

  // scoring.scoringBreakdown is [{ type: 'lesson_complete', ... }, { type:
  // 'consecutive_bonus', points }, { type: 'word', wordID, questionsCorrect,
  // questionsIncorrect, points }, ...], one "word" entry per unique word in
  // the same first-seen order as `uniqueRounds` (the backend derives both
  // from the same per-round sequence) — a word may show up across several
  // rounds (different skill keys), and its points/counts here are the sum
  // across all of them, not just one per word.
  const lessonCompleteEntry = scoring.scoringBreakdown.find((entry) => entry.type === 'lesson_complete');
  const consecutiveBonusEntry = scoring.scoringBreakdown.find((entry) => entry.type === 'consecutive_bonus');
  const wordScoringById = new Map(
    scoring.scoringBreakdown.filter((entry) => entry.type === 'word').map((entry) => [entry.wordID, entry]),
  );
  // Neither has a word of its own to be "credited" alongside — both land in
  // the reward's starting value up front, unlike the per-word bonuses
  // below, which wait for a word to become current.
  const initialReward = (lessonCompleteEntry?.points || 0) + (consecutiveBonusEntry?.points || 0);

  function rewardForWordId(id) {
    return wordScoringById.get(id)?.points || 0;
  }

  // Index into uniqueRounds of the word the wheel is currently centered on.
  const [currentIndex, setCurrentIndex] = useState(0);
  // True for the automated intro sweep from the first word to the last;
  // once that finishes (or there's only one word to begin with) this flips
  // permanently false and hands control to the wheel/arrow-key handlers
  // below — manual navigation, and the current-word panel itself, are
  // deliberately locked out/hidden until then.
  const [autoRotating, setAutoRotating] = useState(true);
  const [reward, setReward] = useState(initialReward);
  // Bumped each time a word's bonus is credited — passed to the reward
  // StatCard as `pulseKey` so it mounts a fresh flash overlay (and thus
  // replays the animation) on every increase. Starts `null` so no flash
  // renders before any bonus has actually landed.
  const [rewardPulseKey, setRewardPulseKey] = useState(null);
  // Correct/Incorrect start at 0 and climb as the wheel sweeps past each
  // word — same "credited the moment it becomes current" treatment as the
  // reward above, so the two NumberDials visibly spin up in lockstep with
  // the wheel.
  const [animatedCorrect, setAnimatedCorrect] = useState(0);
  const [animatedIncorrect, setAnimatedIncorrect] = useState(0);
  const wordListRef = useRef(null);
  // Which words have already had their bonus/counts credited — a plain ref
  // (rather than deriving it from reward/currentIndex) since scrolling
  // back over an already-seen word after the intro finishes must not pay
  // out a second time.
  const rewardedWordIdsRef = useRef(new Set());
  // Which words' score-list rows have had their reward/"--" revealed —
  // unlike the ref above, this needs to be state: it drives what's
  // actually rendered (see .quiz-summary__score-list-reward--revealed),
  // whereas the ref above only gates a side effect.
  const [revealedWordIds, setRevealedWordIds] = useState(() => new Set());

  function clampIndex(index) {
    return Math.max(0, Math.min(lastIndex, index));
  }

  // Drives the intro sweep: schedules the next step at a flat delay until
  // it reaches the last word, then marks the sweep done and stops
  // scheduling entirely.
  useEffect(() => {
    if (!autoRotating) return;
    if (currentIndex >= lastIndex) {
      setAutoRotating(false);
      return;
    }
    const timeout = window.setTimeout(() => setCurrentIndex((i) => i + 1), ROTATE_DELAY_MS);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, autoRotating]);

  // Credits this word's bonus/counts and reveals its score-list row the
  // moment it becomes current, all at most once per word — also runs for
  // the initial index-0 render, so that word's points/row/counts land
  // immediately on mount, not waiting for the first rotation.
  useEffect(() => {
    const word = uniqueRounds[currentIndex];
    if (!word) return;
    const { id } = word.entry;

    setRevealedWordIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));

    if (!rewardedWordIdsRef.current.has(id)) {
      rewardedWordIdsRef.current.add(id);
      const wordScore = wordScoringById.get(id);
      const wordCorrect = wordScore?.questionsCorrect || 0;
      const wordIncorrect = wordScore?.questionsIncorrect || 0;
      if (wordCorrect > 0) setAnimatedCorrect((prev) => prev + wordCorrect);
      if (wordIncorrect > 0) setAnimatedIncorrect((prev) => prev + wordIncorrect);

      const wordReward = rewardForWordId(id);
      if (wordReward > 0) {
        setReward((prev) => prev + wordReward);
        setRewardPulseKey((prev) => (prev ?? 0) + 1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // Mouse wheel / trackpad scrolling over the word list, once the intro
  // sweep is done — accumulates raw deltaY and only steps once it crosses
  // WHEEL_STEP_THRESHOLD, so a scroll gesture snaps one word at a time. A
  // native (non-React) listener registered non-passive, since wheel is
  // passive by default and preventDefault (which blocks the page from
  // scrolling) would otherwise be silently ignored.
  useEffect(() => {
    if (autoRotating) return;
    const el = wordListRef.current;
    if (!el) return;

    let accumulated = 0;
    function handleWheel(e) {
      e.preventDefault();
      accumulated += e.deltaY;
      if (Math.abs(accumulated) < WHEEL_STEP_THRESHOLD) return;
      const direction = accumulated > 0 ? 1 : -1;
      accumulated = 0;
      setCurrentIndex((i) => clampIndex(i + direction));
    }

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRotating]);

  // Arrow keys, once the intro sweep is done — Up/Left step to the
  // previous word, Down/Right to the next, both instant (no accumulation,
  // unlike the wheel above).
  useEffect(() => {
    if (autoRotating) return;
    function handleKeyDown(e) {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex((i) => clampIndex(i - 1));
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentIndex((i) => clampIndex(i + 1));
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRotating]);

  const current = uniqueRounds[currentIndex];

  return (
    <div className="quiz-summary">
      <h2 className="quiz-summary__title">Set Complete!</h2>
      <dl className="quiz-summary__stats">
        <StatCard label="Total" value={total} />
        <StatCard label="Correct" value={<NumberDial value={animatedCorrect} hideLeadingZeros />} variant="success" />
        <StatCard label="Incorrect" value={<NumberDial value={animatedIncorrect} hideLeadingZeros />} variant="fail" />
        <StatCard
          label="Reward"
          value={
            <>
              <NumberDial value={reward} />
              <CoinIcon />
            </>
          }
          variant="reward"
          pulseKey={rewardPulseKey}
        />
      </dl>

      <div className="quiz-summary__review">
        {/* Layer 1 (background): one unified strip of selection rows, each
            spanning the section's full width — the word on the left, the
            reward + tiny mastery diagram on the right. The current row
            marks itself with a caret pinned to each row's own outer edge,
            pointing in toward the word/diagram next to it. Anchoring to
            the outer edge keeps each caret's position fixed regardless of
            how wide the word/reward next to it happens to be. */}
        <div className="quiz-summary__selection-list" ref={wordListRef}>
          <div className="quiz-summary__selection-strip" style={{ '--current-index': currentIndex }}>
            {uniqueRounds.map(({ entry, mastery }, index) => {
              const wordReward = rewardForWordId(entry.id);
              const isCurrent = index === currentIndex;
              const caretClassName = cx('quiz-summary__selection-caret', isCurrent && 'quiz-summary__selection-caret--visible');
              const rewardClassName = cx(
                'quiz-summary__score-list-reward',
                wordReward > 0 && 'quiz-summary__score-list-reward--positive',
                revealedWordIds.has(entry.id) && 'quiz-summary__score-list-reward--revealed',
              );
              return (
                <div
                  key={entry.id}
                  className={cx('quiz-summary__selection-row', isCurrent && 'quiz-summary__selection-row--current')}
                >
                  <button
                    type="button"
                    className="quiz-summary__word-list-item"
                    disabled={autoRotating}
                    onClick={() => setCurrentIndex(index)}
                  >
                    <IoChevronForward className={caretClassName} aria-hidden="true" />
                    <span className="quiz-summary__word-list-label">{entry.word}</span>
                  </button>
                  <div className="quiz-summary__score-list-item">
                    <div className="quiz-summary__score-list-content">
                      <span className={rewardClassName}>{wordReward > 0 ? `+${wordReward}` : '--'}</span>
                      <MasteryPentagon mastery={mastery} />
                      <IoChevronBack className={caretClassName} aria-hidden="true" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {/* Siblings of the clipped list above, not children of it, so their
            overhang paints past the list's own clip edge rather than being
            clipped away along with it. */}
        <span className="quiz-summary__selection-fade quiz-summary__selection-fade--top" aria-hidden="true" />
        <span className="quiz-summary__selection-fade quiz-summary__selection-fade--bottom" aria-hidden="true" />

        {/* Layer 2 (foreground): the current word's full detail, absolutely
            overlaid on top of Layer 1 and centered on the section as a
            whole. Hidden (opacity, not unmounted) until the intro sweep
            finishes, so it doesn't compete with the list racing through
            every word for attention, then fades in once there's an actual
            "current" word worth lingering on. */}
        {current && (
          <div className={cx('quiz-summary__current', !autoRotating && 'quiz-summary__current--visible')}>
            <FuriganaWord furigana={current.entry.furigana} />
            <div className="quiz-summary__current-definition">{current.entry.definition}</div>
            <MasteryPentagon
              key={current.entry.id}
              mastery={current.mastery}
              initialMastery={initialMasteryByWordID[current.entry.id]}
            />
          </div>
        )}
      </div>
    </div>
  );
}

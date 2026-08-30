import { useEffect, useRef, useState } from 'react';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { CoinIcon } from '@/components/quiz/CoinIcon';
import { fireRewardConfetti, originForElement } from '@/components/quiz/coinConfetti';
import { MasteryPentagon } from '@/components/quiz/MasteryPentagon';
import { NumberDial } from '@/components/quiz/NumberDial';
import { StatCard } from '@/components/quiz/StatCard';
import { FuriganaWord } from '@/components/quiz/VocabularyDisplay';
import { cx } from '@/utils/cx';
import './QuizSummary.scss';

// The intro auto-rotation's pacing: starts at ROTATE_START_MS between
// words and multiplies by ROTATE_ACCELERATION every step after, so it
// visibly speeds up as it goes rather than ticking at a flat rate —
// floored at ROTATE_MIN_MS so it never becomes instantaneous.
const ROTATE_START_MS = 300;
const ROTATE_ACCELERATION = 0.88;
const ROTATE_MIN_MS = 50;

function rotateDelayForStep(step) {
  return Math.max(ROTATE_MIN_MS, ROTATE_START_MS * ROTATE_ACCELERATION ** step);
}

// How much accumulated wheel movement counts as "one notch" once manual
// scrolling is live — deliberately coarse so an idle trackpad twitch
// doesn't skip a word, but a real scroll gesture reliably does.
const WHEEL_STEP_THRESHOLD = 40;

// Zeni (銭) — this lesson's play-money reward. A flat amount just for
// finishing, plus a bonus per *correct* round on a word (so a word tested
// twice and gotten right both times is worth double one gotten right
// once), credited the moment that word first becomes "current" — during
// the intro rotation or, once that's done, by scrolling/arrowing to it —
// rather than shown as a final total outright.
const REWARD_BASE = 10;
const REWARD_PER_CORRECT_ROUND = 3;

export function QuizSummary({ results, total, rounds, initialMasteryByWordID }) {
  const correct = results.filter((result) => result === 'success').length;
  const incorrect = results.filter((result) => result === 'fail').length;

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

  // A word may show up across several rounds (different skill keys) — its
  // reward is 3 zeni per one of those rounds that was answered correctly,
  // not just a flat bonus for having gotten *any* of them right.
  const correctRoundCountByWordId = new Map();
  rounds.forEach((round, i) => {
    if (results[i] !== 'success') return;
    const { id } = round.entry;
    correctRoundCountByWordId.set(id, (correctRoundCountByWordId.get(id) || 0) + 1);
  });

  function rewardForWordId(id) {
    return (correctRoundCountByWordId.get(id) || 0) * REWARD_PER_CORRECT_ROUND;
  }

  // Index into uniqueRounds of the word the wheel is currently centered on.
  const [currentIndex, setCurrentIndex] = useState(0);
  // True for the automated intro sweep from the first word to the last;
  // once that finishes (or there's only one word to begin with) this flips
  // permanently false and hands control to the wheel/arrow-key handlers
  // below — manual navigation, and the current-word panel itself, are
  // deliberately locked out/hidden until then.
  const [autoRotating, setAutoRotating] = useState(true);
  const [reward, setReward] = useState(REWARD_BASE);
  const wordListRef = useRef(null);
  // The reward StatCard's DOM node, for centering the confetti burst below.
  const rewardCardRef = useRef(null);
  // Which words have already had their bonus credited — a plain ref
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

  // Drives the intro sweep: schedules the next step at an ever-shorter
  // delay until it reaches the last word, then marks the sweep done and
  // stops scheduling entirely.
  useEffect(() => {
    if (!autoRotating) return;
    if (currentIndex >= lastIndex) {
      setAutoRotating(false);
      return;
    }
    const timeout = window.setTimeout(() => setCurrentIndex((i) => i + 1), rotateDelayForStep(currentIndex));
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, autoRotating]);

  // Credits this word's bonus and reveals its score-list row the moment it
  // becomes current, both at most once per word — also runs for the
  // initial index-0 render, so that word's points/row land immediately on
  // mount rather than waiting for the first rotation. Confetti is
  // deliberately tied to the same "actually credited new points" branch
  // (and gated on autoRotating) so it only bursts during the sweep itself,
  // never from re-visiting an already-scored word afterward.
  useEffect(() => {
    const word = uniqueRounds[currentIndex];
    if (!word) return;
    const { id } = word.entry;

    setRevealedWordIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));

    const wordReward = rewardForWordId(id);
    if (wordReward > 0 && !rewardedWordIdsRef.current.has(id)) {
      rewardedWordIdsRef.current.add(id);
      setReward((prev) => prev + wordReward);
      if (autoRotating && rewardCardRef.current) {
        fireRewardConfetti(originForElement(rewardCardRef.current));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex]);

  // Mouse wheel / trackpad scrolling over the word list, once the intro
  // sweep is done — accumulates raw deltaY and only steps once it crosses
  // WHEEL_STEP_THRESHOLD, so a scroll gesture snaps one word at a time
  // instead of following the cursor continuously. A native (non-React)
  // listener registered non-passive, since wheel is passive by default and
  // preventDefault (blocking the page from scrolling instead) would
  // otherwise be silently ignored.
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
        <StatCard label="Correct" value={correct} variant="success" />
        <StatCard label="Incorrect" value={incorrect} variant="fail" />
        <StatCard
          ref={rewardCardRef}
          label="Reward"
          value={
            <>
              <NumberDial value={reward} />
              <CoinIcon />
            </>
          }
          variant="reward"
        />
      </dl>

      <div className="quiz-summary__review">
        {/* Layer 1 (background): one unified strip of selection rows, each
            spanning the section's full width — the word on the left, the
            reward + tiny mastery diagram on the right. The current row
            marks itself with a caret pinned to each row's own outer edge
            (pointing in, toward the word/diagram next to it) rather than
            any kind of highlight — outer edge rather than flanking the
            middle gap so each caret's position stays fixed regardless of
            how wide the word/reward next to it happens to be, instead of
            hopping around from row to row. See the carets' own fade-in/
            instant-out transition in QuizSummary.scss. */}
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
        {/* Siblings of the clipped list above, not children of it: the list's
            own overflow: hidden clips its transformed strip and these fades
            to slightly different device pixels (a transform forces its own
            compositing layer, which can round its clip edge by a subpixel
            relative to an untransformed sibling), leaving a hairline seam
            where a row peeks through right at the edge. Living outside that
            clip means the fades' own overhang (see below) actually paints
            over the seam instead of being clipped away identically to it. */}
        <span className="quiz-summary__selection-fade quiz-summary__selection-fade--top" aria-hidden="true" />
        <span className="quiz-summary__selection-fade quiz-summary__selection-fade--bottom" aria-hidden="true" />

        {/* Layer 2 (foreground): the current word's full detail, absolutely
            overlaid on top of Layer 1 and centered on the section as a
            whole (see QuizSummary.scss) rather than confined to a middle
            flex column. Now that the carets above sit at each row's outer
            edge rather than flanking the middle, there's nothing in the
            vertical middle worth leaving a gap for, so this is one plain
            centered block again instead of a top/bottom split. Hidden
            (opacity, not unmounted) until the intro sweep finishes, so it
            doesn't compete with the list racing through every word for
            attention, then fades in once there's an actual "current" word
            worth lingering on. */}
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

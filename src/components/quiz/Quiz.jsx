import { useCallback, useEffect, useRef, useState } from 'react';
import { modernQuizApi } from '@/utils/api/modernQuiz';
import { VocabularyDisplay } from '@/components/quiz/VocabularyDisplay';
import { ChoiceGrid } from '@/components/quiz/ChoiceGrid';
import { SpellingSlots } from '@/components/quiz/SpellingSlots';
import { SpellingTiles } from '@/components/quiz/SpellingTiles';
import { ReadingInput } from '@/components/quiz/ReadingInput';
import { ActionButton } from '@/components/quiz/ActionButton';
import { QuizHeader } from '@/components/quiz/QuizHeader';
import { QuizFooter } from '@/components/quiz/QuizFooter';
import { QuizSummary } from '@/components/quiz/QuizSummary';
import { SettingsDialog } from '@/components/quiz/SettingsDialog';
import { cx } from '@/utils/cx';
import './Quiz.scss';

// Must match the opacity transition duration in Quiz.scss — the content
// swap happens at the trough of the fade, once the old content is gone.
const TRANSITION_MS = 500;

// Minimum gap between Enter-triggered actions (Check / Next / Next Lesson).
// Key repeat while Enter is held down fires many keydown events in quick
// succession — without this, holding it past the first press would blow
// through several questions' worth of Check-then-Next before the user can
// let go.
const ENTER_ACTION_DEBOUNCE_MS = 50;

// spellingSlots[i] is null (empty) or a tile index into round.tiles — empty
// for non-spelling rounds, one null per answer character for spelling rounds.
function initSpellingSlots(round) {
  return round?.mode === 'spelling' ? Array(round.correctAnswer.length).fill(null) : [];
}

// Per-question-mode behavior, keyed by round.mode — the one place that
// knows how to tell each mode's answer is complete (isAnswered), grade it
// (isCorrect), and size its blank (ghostText). Adding a new mode only means
// adding an entry here instead of extending three separate branches.
const MODES = {
  spelling: {
    isAnswered: ({ spellingSlots }) => spellingSlots.every((slot) => slot !== null),
    isCorrect: ({ spellingSlots, tiles, correctAnswer }) =>
      spellingSlots.map((tileIndex) => tiles[tileIndex]).join('') === correctAnswer,
    // The spelling and typing blanks are sized to the answer itself — the
    // slot row (spelling) or lack of choices (typing) already reveals the
    // exact character count, so there's nothing left to hide by doing
    // otherwise.
    ghostText: ({ correctAnswer }) => correctAnswer,
  },
  typing: {
    isAnswered: ({ typedAnswer }) => typedAnswer.trim().length > 0,
    isCorrect: ({ typedAnswer, correctAnswer }) => typedAnswer.trim() === correctAnswer,
    ghostText: ({ correctAnswer }) => correctAnswer,
  },
  choice: {
    isAnswered: ({ selectedIndex }) => selectedIndex !== null,
    isCorrect: ({ selectedIndex, correctIndex }) => selectedIndex === correctIndex,
    // Sized to the longest choice, not the correct one, so the blank's
    // width never gives away which option is right.
    ghostText: ({ choices }) => choices.reduce((longest, choice) => (choice.length > longest.length ? choice : longest), ''),
  },
};

export function Quiz() {
  const [rounds, setRounds] = useState(null);
  // Word id -> mastery, captured once right after a lesson loads, before
  // any answering mutates `rounds[i].mastery` — lets the summary animate
  // from "before this quiz" to "after" instead of only ever showing the
  // final state.
  const [initialMasteryByWordID, setInitialMasteryByWordID] = useState({});
  const [questionIndex, setQuestionIndex] = useState(0);
  // 'success' | 'fail' per completed question index, for the progress dots
  // and the end-of-set summary.
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [spellingSlots, setSpellingSlots] = useState([]);
  // Read-only mirror of ReadingInput's live (wanakana-converted) value —
  // never written back into the input, see ReadingInput.jsx.
  const [typedAnswer, setTypedAnswer] = useState('');
  // 'answer': picking a choice; 'review': Check was pressed, showing
  // success/fail colors and waiting for Next to advance; 'summary': every
  // question in the set is done.
  const [phase, setPhase] = useState('answer');
  // True for the brief window between clicking Next and the new question
  // (or summary) appearing — drives the fade-out/fade-in crossfade. Also
  // held true across a "Next Lesson" reload, for however long that fetch
  // actually takes (see handleNextLesson).
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const transitionTimeoutRef = useRef(null);
  const lastEnterActionRef = useRef(0);

  useEffect(() => () => window.clearTimeout(transitionTimeoutRef.current), []);

  const loadLesson = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const { questions } = await modernQuizApi.generateLesson();
      setRounds(questions);
      setInitialMasteryByWordID(Object.fromEntries(questions.map((round) => [round.entry.id, round.mastery])));
      setResults([]);
      setQuestionIndex(0);
      setSelectedIndex(null);
      setSpellingSlots(initSpellingSlots(questions[0]));
      setTypedAnswer('');
      setPhase('answer');
    } catch (error) {
      setLoadError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLesson();
  }, [loadLesson]);

  const currentRound = rounds?.[questionIndex];
  const { entry, hidden, mode, choices, correctIndex, tiles, correctAnswer, skillKey, mastery } = currentRound || {};
  const modeConfig = currentRound ? MODES[mode] : null;
  // The state every mode's isAnswered/isCorrect/ghostText draws from — each
  // mode's functions only read the slice of this that's relevant to it.
  const answerState = { spellingSlots, typedAnswer, selectedIndex, tiles, correctAnswer, choices, correctIndex };

  const isAnswered = modeConfig ? modeConfig.isAnswered(answerState) : false;

  // Tile indices currently sitting in a slot — derived rather than tracked
  // separately, since a slot can only ever hold the one tile placed into it.
  const usedTileIndices = new Set(spellingSlots.filter((tileIndex) => tileIndex !== null));

  const ghostText = modeConfig ? modeConfig.ghostText(answerState) : '';

  // Fades the current content out, runs `update` once it's invisible, then
  // lets the (now different) content fade back in.
  function transitionTo(update) {
    setIsTransitioning(true);
    transitionTimeoutRef.current = window.setTimeout(() => {
      update();
      setIsTransitioning(false);
    }, TRANSITION_MS);
  }

  function handlePlaceTile(tileIndex) {
    setSpellingSlots((prev) => {
      const nextEmptyIndex = prev.indexOf(null);
      if (nextEmptyIndex === -1 || prev.includes(tileIndex)) return prev;
      const next = [...prev];
      next[nextEmptyIndex] = tileIndex;
      return next;
    });
  }

  function handleRemoveTile(slotIndex) {
    setSpellingSlots((prev) => {
      if (prev[slotIndex] === null) return prev;
      // Filled slots are always a contiguous prefix (place always targets
      // the first empty slot), so dropping this one and re-padding with
      // nulls is equivalent to shifting everything after it left.
      const placed = prev.filter((tileIndex, i) => tileIndex !== null && i !== slotIndex);
      return [...placed, ...Array(prev.length - placed.length).fill(null)];
    });
  }

  async function handleAction() {
    if (phase === 'answer') {
      if (!isAnswered) return;
      setPhase('review');

      const isCorrect = modeConfig.isCorrect(answerState);

      setResults((prev) => {
        const next = [...prev];
        next[questionIndex] = isCorrect ? 'success' : 'fail';
        return next;
      });

      try {
        const { mastery: updatedMastery } = await modernQuizApi.recordPractice(entry.id, skillKey, isCorrect);
        setRounds((prev) => {
          const next = [...prev];
          next[questionIndex] = { ...next[questionIndex], mastery: updatedMastery };
          return next;
        });
      } catch (error) {
        // Fire-and-forget from the user's perspective — a failed practice
        // record shouldn't block moving on through the lesson.
        console.warn('Failed to record practice attempt:', error);
      }
      return;
    }

    transitionTo(() => {
      if (questionIndex === rounds.length - 1) {
        setPhase('summary');
      } else {
        const nextIndex = questionIndex + 1;
        setQuestionIndex(nextIndex);
        setSelectedIndex(null);
        setSpellingSlots(initSpellingSlots(rounds[nextIndex]));
        setTypedAnswer('');
        setPhase('answer');
      }
    });
  }

  function handleSettingsClick() {
    setIsSettingsOpen(true);
  }

  // Unlike transitionTo (a fixed cosmetic delay for the purely local
  // per-question advance above), this fades out immediately and stays
  // faded for however long the fresh-lesson fetch actually takes, rather
  // than guessing a fixed duration for a network call.
  function handleNextLesson() {
    setIsTransitioning(true);
    loadLesson().finally(() => setIsTransitioning(false));
  }

  // Keyboard shortcuts: 1-4 select a choice (while still answering, choice
  // mode only), Enter triggers whatever the action button currently does
  // (Check, Next, or — at the end of a lesson — Next Lesson). Disabled
  // whenever the settings dialog is open — otherwise these fire on the quiz
  // underneath a modal that's supposed to have captured input.
  useEffect(() => {
    function handleKeyDown(e) {
      if (!currentRound || isTransitioning || isSettingsOpen) return;

      const num = Number(e.key);
      if (mode === 'choice' && phase === 'answer' && num >= 1 && num <= choices.length) {
        e.preventDefault();
        setSelectedIndex(num - 1);
      } else if (e.key === 'Enter' && (phase === 'summary' || phase === 'review' || isAnswered)) {
        // If a choice button still has focus (e.g. from a prior click),
        // Enter's native behavior is to also click it — re-selecting a
        // choice right after handleAction() already moved on. preventDefault
        // stops that native click, and blurring drops focus so a later
        // plain Enter press (no keyboard selection first) can't re-trigger
        // it either.
        e.preventDefault();
        document.activeElement?.blur();

        // Debounce so holding Enter down (which fires repeat keydowns every
        // ~30-50ms) doesn't blow through Check-then-Next-then-Check in
        // rapid succession — only the first press within the window acts.
        const now = Date.now();
        if (now - lastEnterActionRef.current < ENTER_ACTION_DEBOUNCE_MS) return;
        lastEnterActionRef.current = now;

        if (phase === 'summary') {
          handleNextLesson();
        } else {
          handleAction();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentRound, mode, choices, selectedIndex, spellingSlots, typedAnswer, phase, isTransitioning, isSettingsOpen]);

  // Only the very first load (no rounds yet) takes over the whole page —
  // a "Next Lesson" reload keeps the existing chrome and reuses the
  // crossfade instead (see handleNextLesson).
  if (isLoading && !rounds) {
    return (
      <div className="quiz-page quiz-page--status">
        <p>Loading lesson...</p>
      </div>
    );
  }

  if (loadError && !rounds) {
    return (
      <div className="quiz-page quiz-page--status">
        <p>Could not load the quiz.</p>
        <ActionButton label="Retry" onClick={loadLesson} />
      </div>
    );
  }

  const footerLabel = phase === 'summary' ? 'Next Lesson' : phase === 'review' ? 'Next' : 'Check';
  const footerAction = phase === 'summary' ? handleNextLesson : handleAction;
  const footerDisabled = isTransitioning || (phase === 'answer' && !isAnswered);

  return (
    <div className="quiz-page">
      {/* Inert whenever the settings dialog is open — it's portaled outside
          this subtree (see SettingsDialog), so this doesn't touch it, but it
          does stop the quiz behind it from being reachable by Tab/click or
          exposed to assistive tech while the dialog has focus. */}
      <div className="quiz-page__interactive" inert={isSettingsOpen ? '' : undefined}>
        <QuizHeader
          results={results}
          currentIndex={phase === 'summary' ? -1 : questionIndex}
          total={rounds.length}
          onSettingsClick={handleSettingsClick}
        />

        <main className="quiz-page__main">
          <div className={cx('quiz__content', isTransitioning && 'quiz__content--hidden', phase === 'summary' && 'quiz__content--summary')}>
            {phase === 'summary' ? (
              <QuizSummary
                results={results}
                total={rounds.length}
                rounds={rounds}
                initialMasteryByWordID={initialMasteryByWordID}
              />
            ) : (
              <>
                <VocabularyDisplay
                  entry={entry}
                  hidden={hidden}
                  ghostText={ghostText}
                  revealed={phase === 'review'}
                  mastery={mastery}
                  currentSkillKey={phase === 'answer' ? skillKey : null}
                />
                <div className="quiz__answer-area">
                  {mode === 'spelling' ? (
                    <>
                      <SpellingSlots
                        tiles={tiles}
                        slots={spellingSlots}
                        correctAnswer={correctAnswer}
                        revealed={phase === 'review'}
                        onRemove={handleRemoveTile}
                      />
                      <SpellingTiles
                        tiles={tiles}
                        usedTileIndices={usedTileIndices}
                        revealed={phase === 'review'}
                        onSelect={handlePlaceTile}
                      />
                    </>
                  ) : mode === 'typing' ? (
                    <ReadingInput
                      key={questionIndex}
                      typedAnswer={typedAnswer}
                      correctAnswer={correctAnswer}
                      revealed={phase === 'review'}
                      onChange={setTypedAnswer}
                    />
                  ) : (
                    <ChoiceGrid
                      choices={choices}
                      selectedIndex={selectedIndex}
                      onSelect={setSelectedIndex}
                      correctIndex={correctIndex}
                      revealed={phase === 'review'}
                      emphasized={hidden === 'word'}
                      japanese={hidden !== 'definition'}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </main>

        <QuizFooter>
          <ActionButton label={footerLabel} onClick={footerAction} disabled={footerDisabled} />
        </QuizFooter>
      </div>

      {isSettingsOpen && <SettingsDialog onClose={() => setIsSettingsOpen(false)} />}
    </div>
  );
}

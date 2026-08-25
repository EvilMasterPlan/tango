import { useEffect, useRef, useState } from 'react';
import vocabData from '@/data/distilled_vocab.min.json';
import { VARIANT_GENERATORS } from '@/utils/vocabVariants';
import { getSpellingTiles } from '@/utils/spellingVariants';
import { getSkillKey, recordPracticeAttempt } from '@/utils/practiceStats';
import { VocabularyDisplay } from '@/components/quiz/modern/VocabularyDisplay';
import { ChoiceGrid } from '@/components/quiz/modern/ChoiceGrid';
import { SpellingSlots } from '@/components/quiz/modern/SpellingSlots';
import { SpellingTiles } from '@/components/quiz/modern/SpellingTiles';
import { ReadingInput } from '@/components/quiz/modern/ReadingInput';
import { ActionButton } from '@/components/quiz/modern/ActionButton';
import { QuizProgress } from '@/components/quiz/modern/QuizProgress';
import { QuizSummary } from '@/components/quiz/modern/QuizSummary';
import './Quiz.scss';

const { vocab } = vocabData;
// 'spelling' and 'typing' both reuse hidden: 'reading' (word + meaning
// shown, reading blanked) — same info as the 'reading' choice variant, just
// answered by building/typing the reading instead of picking it from 4
// options.
const VARIANTS = ['word', 'reading', 'definition', 'spelling', 'typing'];
const QUESTION_COUNT = 10;
// Must match the opacity transition duration in Quiz.scss — the content
// swap happens at the trough of the fade, once the old content is gone.
const TRANSITION_MS = 500;

function shuffle(list) {
  return [...list].sort(() => Math.random() - 0.5);
}

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function generateRound(entry) {
  const variant = pickRandom(VARIANTS);

  if (variant === 'spelling') {
    const { tiles, correctAnswer } = getSpellingTiles(entry);
    return { entry, hidden: 'reading', mode: 'spelling', tiles, correctAnswer };
  }

  if (variant === 'typing') {
    return { entry, hidden: 'reading', mode: 'typing', correctAnswer: entry.reading };
  }

  const hidden = variant;
  const correctAnswer = entry[hidden];
  const wrongVariants = VARIANT_GENERATORS[hidden](entry);
  const choices = shuffle([correctAnswer, ...wrongVariants]);
  const correctIndex = choices.indexOf(correctAnswer);

  return { entry, hidden, mode: 'choice', choices, correctIndex };
}

// Distinct entries (no repeats within one set of 10).
function generateRounds() {
  return shuffle(vocab).slice(0, QUESTION_COUNT).map(generateRound);
}

// spellingSlots[i] is null (empty) or a tile index into round.tiles — empty
// for non-spelling rounds, one null per answer character for spelling rounds.
function initSpellingSlots(round) {
  return round.mode === 'spelling' ? Array(round.correctAnswer.length).fill(null) : [];
}

export function Quiz() {
  const [rounds, setRounds] = useState(generateRounds);
  const [questionIndex, setQuestionIndex] = useState(0);
  // 'success' | 'fail' per completed question index, for the progress dots
  // and the end-of-set summary.
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [spellingSlots, setSpellingSlots] = useState(() => initSpellingSlots(rounds[0]));
  // Read-only mirror of ReadingInput's live (wanakana-converted) value —
  // never written back into the input, see ReadingInput.jsx.
  const [typedAnswer, setTypedAnswer] = useState('');
  // 'answer': picking a choice; 'review': Check was pressed, showing
  // success/fail colors and waiting for Next to advance; 'summary': all 10
  // questions are done.
  const [phase, setPhase] = useState('answer');
  // True for the brief window between clicking Next and the new question
  // (or summary) appearing — drives the fade-out/fade-in crossfade.
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef(null);

  useEffect(() => () => window.clearTimeout(transitionTimeoutRef.current), []);

  const { entry, hidden, mode, choices, correctIndex, tiles, correctAnswer } = rounds[questionIndex];

  const isAnswered = mode === 'spelling'
    ? spellingSlots.every((slot) => slot !== null)
    : mode === 'typing'
      ? typedAnswer.trim().length > 0
      : selectedIndex !== null;

  // Tile indices currently sitting in a slot — derived rather than tracked
  // separately, since a slot can only ever hold the one tile placed into it.
  const usedTileIndices = new Set(spellingSlots.filter((tileIndex) => tileIndex !== null));

  // Sized to the longest choice (choice mode) or the answer itself (spelling
  // and typing modes) — not the correct answer among choices — so the
  // blank's width never gives away which option is right. For spelling, the
  // slot row already reveals the exact character count, so there's nothing
  // left to hide by sizing the ghost to the real answer; typing mode has no
  // choices to size against at all.
  const ghostText = mode === 'spelling' || mode === 'typing'
    ? correctAnswer
    : choices.reduce((longest, choice) => (choice.length > longest.length ? choice : longest), '');

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

  function handleAction() {
    if (phase === 'answer') {
      if (!isAnswered) return;
      setPhase('review');

      const isCorrect = mode === 'spelling'
        ? spellingSlots.map((tileIndex) => tiles[tileIndex]).join('') === correctAnswer
        : mode === 'typing'
          ? typedAnswer.trim() === correctAnswer
          : selectedIndex === correctIndex;

      setResults((prev) => {
        const next = [...prev];
        next[questionIndex] = isCorrect ? 'success' : 'fail';
        return next;
      });
      recordPracticeAttempt(entry.id, getSkillKey(hidden, mode), isCorrect);
      return;
    }

    transitionTo(() => {
      if (questionIndex === QUESTION_COUNT - 1) {
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

  function handleNextLesson() {
    transitionTo(() => {
      const newRounds = generateRounds();
      setRounds(newRounds);
      setResults([]);
      setQuestionIndex(0);
      setSelectedIndex(null);
      setSpellingSlots(initSpellingSlots(newRounds[0]));
      setTypedAnswer('');
      setPhase('answer');
    });
  }

  // Keyboard shortcuts: 1-4 select a choice (while still answering, choice
  // mode only), Enter triggers whatever the action button currently does
  // (Check or Next).
  useEffect(() => {
    function handleKeyDown(e) {
      if (isTransitioning || phase === 'summary') return;

      const num = Number(e.key);
      if (mode === 'choice' && phase === 'answer' && num >= 1 && num <= choices.length) {
        e.preventDefault();
        setSelectedIndex(num - 1);
      } else if (e.key === 'Enter' && (phase === 'review' || isAnswered)) {
        // If a choice button still has focus (e.g. from a prior click),
        // Enter's native behavior is to also click it — re-selecting a
        // choice right after handleAction() already moved on. preventDefault
        // stops that native click, and blurring drops focus so a later
        // plain Enter press (no keyboard selection first) can't re-trigger
        // it either.
        e.preventDefault();
        document.activeElement?.blur();
        handleAction();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, choices, selectedIndex, spellingSlots, typedAnswer, phase, isTransitioning]);

  return (
    <div className="quiz">
      <QuizProgress
        results={results}
        currentIndex={phase === 'summary' ? -1 : questionIndex}
        total={QUESTION_COUNT}
      />
      <div className={`quiz__content${isTransitioning ? ' quiz__content--hidden' : ''}`}>
        {phase === 'summary' ? (
          <QuizSummary results={results} total={QUESTION_COUNT} onNextLesson={handleNextLesson} />
        ) : (
          <>
            <VocabularyDisplay entry={entry} hidden={hidden} ghostText={ghostText} revealed={phase === 'review'} />
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
                />
              )}
            </div>
            <ActionButton
              label={phase === 'review' ? 'Next' : 'Check'}
              onClick={handleAction}
              disabled={isTransitioning || (phase === 'answer' && !isAnswered)}
            />
          </>
        )}
      </div>
    </div>
  );
}

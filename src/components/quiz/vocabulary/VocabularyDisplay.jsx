import { Fragment, useLayoutEffect, useRef } from 'react';
import { getChallengeRating } from '@/utils/challengeRating';
import { cx } from '@/utils/cx';
import { shrinkFontToFit } from '@/utils/shrinkFontToFit';
import { MasteryPentagon } from '@/components/quiz/charts/MasteryPentagon';
import './VocabularyDisplay.scss';

// Shrinks the word text down to fit on one line, for words too long to fit
// at the base 4rem — both possible renderings (the plain word line, and the
// merged furigana view, whose reading rides along for free since it's sized
// in em relative to this) are shrunk independently, since either can be the
// one on screen depending on `hidden`/`revealed`. Measures against
// .vocabulary-display__word-block's own width, since that's the stable,
// not-itself-overflowing ancestor both prompts stretch to fill.
function useShrinkWordToFit(wordBlockRef, promptRefs, deps) {
  useLayoutEffect(() => {
    const container = wordBlockRef.current;
    if (!container) return;

    promptRefs.forEach((promptRef) => {
      const el = promptRef.current;
      if (!el) return;

      // Forces the text onto one line so scrollWidth reveals its true
      // natural width — restored after, so the CSS word-break fallback
      // still guards extreme cases beyond the minimum font scale.
      el.style.whiteSpace = 'nowrap';
      shrinkFontToFit(el, () => el.scrollWidth <= container.clientWidth + 1);
      el.style.whiteSpace = '';
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

function Blank({ ghostText }) {
  return (
    <span className="vocabulary-display__blank-wrap">
      <span className="vocabulary-display__blank-ghost" aria-hidden="true">
        {ghostText}
      </span>
      <span className="vocabulary-display__blank-box">?</span>
    </span>
  );
}

// A single <ruby> spanning the whole word, with one <rt> per segment —
// native multi-annotation ruby markup renders each reading centered
// directly above its own run, but only if every run is closed off by its
// own <rt>. A kana run (reading === text) has nothing to annotate, but it
// still needs an *empty* <rt> rather than none at all: the ruby base-
// grouping algorithm merges consecutive non-<rt> children into one shared
// base up to the next <rt> it finds, so an omitted <rt> after a middle kana
// run (e.g. の in 男の人) would silently fuse it with the following kanji
// run and center that kanji's reading over both. This has to stay one
// element — splitting it into one <ruby> per segment introduces a stray
// newline between segments in Chromium's copy/paste serialization (which
// treats each <ruby> as its own text-serialization block).
export function FuriganaWord({ furigana }) {
  return (
    <ruby className="vocabulary-display__furigana-word">
      {furigana.map((segment, index) => (
        <Fragment key={index}>
          {segment.text}
          <rt>{segment.reading !== segment.text ? segment.reading : ''}</rt>
        </Fragment>
      ))}
    </ruby>
  );
}

// Shows word/reading/definition for a vocab entry, blanking out whichever
// property is `hidden` (unless `revealed`, once Check has been pressed).
// Word and reading render as two plain stacked lines only while one of them
// is still blanked out — a plain reading line centered over the word is
// fine there since there's nothing to align it against yet. Once both are
// known (hidden === 'definition' from the start, or hidden === 'word'/
// 'reading' once revealed), they're merged into a single furigana display
// so each reading segment sits directly over its own kanji.
export function VocabularyDisplay({ entry, hidden, ghostText, revealed = false, mastery, currentSkillKey, justLeveledUp }) {
  const showFurigana = hidden === 'definition' || revealed;
  const challengeRating = getChallengeRating(entry.score);

  const wordBlockRef = useRef(null);
  const furiganaPromptRef = useRef(null);
  const wordPromptRef = useRef(null);
  useShrinkWordToFit(wordBlockRef, [furiganaPromptRef, wordPromptRef], [entry.word, entry.furigana, hidden]);

  return (
    <div className="vocabulary-display">
      {/* Same fixed width as the rating column on the right, so the centered
          content in the middle stays centered on the card as a whole. */}
      <div className="vocabulary-display__side vocabulary-display__mastery" aria-hidden="true">
        <MasteryPentagon mastery={mastery} currentSkillKey={currentSkillKey} justLeveledUp={justLeveledUp} />
      </div>

      <div className="vocabulary-display__center">
        {/* Both layouts stay mounted, stacked in the same grid cell, so this
            block's height is always the taller of the two — the reveal
            toggling which one is visible never shifts anything below it. */}
        <div className="vocabulary-display__word-block" ref={wordBlockRef}>
          <div
            ref={furiganaPromptRef}
            className={cx(
              'vocabulary-display__prompt',
              'vocabulary-display__prompt--furigana',
              'vocabulary-display__word-slot',
              !showFurigana && 'vocabulary-display__word-slot--inactive',
            )}
            aria-hidden={!showFurigana}
          >
            <FuriganaWord furigana={entry.furigana} />
          </div>
          <div
            className={cx(
              'vocabulary-display__word-slot',
              'vocabulary-display__word-lines',
              showFurigana && 'vocabulary-display__word-slot--inactive',
            )}
            aria-hidden={showFurigana}
          >
            <div className="vocabulary-display__prompt vocabulary-display__prompt--reading">
              {hidden === 'reading' ? <Blank ghostText={ghostText} /> : entry.reading}
            </div>
            <div ref={wordPromptRef} className="vocabulary-display__prompt vocabulary-display__prompt--word">
              {hidden === 'word' ? <Blank ghostText={ghostText} /> : entry.word}
            </div>
          </div>
        </div>
        <div className="vocabulary-display__prompt vocabulary-display__prompt--definition">
          {hidden === 'definition' && !revealed ? <Blank ghostText={ghostText} /> : entry.definition}
        </div>
      </div>

      <div
        className="vocabulary-display__side vocabulary-display__challenge-rating"
        aria-label={`Challenge rating: ${challengeRating}${entry.jlpt ? `, JLPT ${entry.jlpt}` : ''}`}
      >
        <span className="vocabulary-display__challenge-rating-value">{challengeRating}</span>
        {entry.jlpt ? <span className="vocabulary-display__jlpt-level">{entry.jlpt}</span> : null}
      </div>
    </div>
  );
}

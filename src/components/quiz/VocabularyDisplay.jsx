import { Fragment } from 'react';
import { getChallengeRating } from '@/utils/challengeRating';
import { MasteryPentagon } from '@/components/quiz/MasteryPentagon';
import './VocabularyDisplay.scss';

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
// run and center that kanji's reading over both. Splitting this into one
// <ruby> per segment instead would copy/paste with a stray newline inserted
// between segments (Chromium treats each <ruby> as its own text-
// serialization block), so it has to stay one element.
function FuriganaWord({ furigana }) {
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
// so each reading segment sits directly over its own kanji instead of just
// floating, centered, over the word as a whole.
export function VocabularyDisplay({ entry, hidden, ghostText, revealed = false, mastery, currentSkillKey }) {
  const showFurigana = hidden === 'definition' || revealed;
  const challengeRating = getChallengeRating(entry.score);

  return (
    <div className="vocabulary-display">
      {/* Same fixed width as the rating column on the right, so the centered
          content in the middle stays centered on the card as a whole rather
          than drifting toward the rating's side. */}
      <div className="vocabulary-display__side vocabulary-display__mastery" aria-hidden="true">
        <MasteryPentagon mastery={mastery} currentSkillKey={currentSkillKey} />
      </div>

      <div className="vocabulary-display__center">
        {/* Both layouts stay mounted, stacked in the same grid cell, so this
            block's height is always the taller of the two — the reveal
            toggling which one is visible never shifts anything below it. */}
        <div className="vocabulary-display__word-block">
          <div
            className={`vocabulary-display__prompt vocabulary-display__prompt--furigana vocabulary-display__word-slot${showFurigana ? '' : ' vocabulary-display__word-slot--inactive'}`}
            aria-hidden={!showFurigana}
          >
            <FuriganaWord furigana={entry.furigana} />
          </div>
          <div
            className={`vocabulary-display__word-slot vocabulary-display__word-lines${showFurigana ? ' vocabulary-display__word-slot--inactive' : ''}`}
            aria-hidden={showFurigana}
          >
            <div className="vocabulary-display__prompt vocabulary-display__prompt--reading">
              {hidden === 'reading' ? <Blank ghostText={ghostText} /> : entry.reading}
            </div>
            <div className="vocabulary-display__prompt vocabulary-display__prompt--word">
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

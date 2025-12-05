import './VocabDisplay.scss';

export function VocabDisplay({ word, reading, meaning }) {
  const hasWord = word && word.trim();
  const hasReading = reading && reading.trim();
  const hasMeaning = meaning && meaning.trim();
  const hasBothWordAndReading = hasWord && hasReading;

  return (
    <div className="vocab-display">
      {hasBothWordAndReading ? (
        <div className="vocab-word-with-furigana">
          <div className="vocab-reading-furigana">{reading}</div>
          <div className="vocab-word">{word}</div>
        </div>
      ) : (
        <>
          {hasReading && <div className="vocab-reading">{reading}</div>}
          {hasWord && <div className="vocab-word">{word}</div>}
        </>
      )}
      {hasMeaning && <div className="vocab-meaning">{meaning}</div>}
    </div>
  );
}


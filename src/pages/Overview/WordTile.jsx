import { useLayoutEffect, useRef } from 'react';
import { MasteryGem } from '@/components/quiz/charts/MasteryGem';
import { FuriganaWord } from '@/components/quiz/vocabulary/VocabularyDisplay';
import { jlptGemColor } from '@/utils/jlptGemColor';
import { shrinkFontToFit } from '@/utils/shrinkFontToFit';
import '@/pages/Overview/WordTile.scss';

// Shrinks the word and definition lines independently to fit within the
// tile's info column, the same shrinkFontToFit-driven approach
// VocabularyDisplay uses for the word on the quiz page — multi-line here
// would break the grid's uniform card height, so both lines are measured
// with nowrap forced on and stepped down until they fit, rather than ever
// being allowed to wrap.
function useShrinkTileText(infoRef, textRefs, deps) {
  useLayoutEffect(() => {
    const container = infoRef.current;
    if (!container) return;

    textRefs.forEach((textRef) => {
      const el = textRef.current;
      if (!el) return;
      shrinkFontToFit(el, () => el.scrollWidth <= container.clientWidth + 1);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export function WordTile({ entry, mastery }) {
  const color = jlptGemColor(entry.jlpt) || 'blue';

  const infoRef = useRef(null);
  const wordRef = useRef(null);
  const definitionRef = useRef(null);
  useShrinkTileText(infoRef, [wordRef, definitionRef], [entry.furigana, entry.definition]);

  return (
    <div className="word-tile" data-jlpt-color={color}>
      <MasteryGem mastery={mastery} color={color} />
      <div className="word-tile__info" ref={infoRef}>
        {/* The shrink/clip target is this wrapper, not the <ruby> itself —
            overflow/white-space/display on the ruby element directly breaks
            its native ruby-annotation layout (kanji get spaced way out to
            fill the box). Font-size set here is inherited down into the
            ruby, same as VocabularyDisplay's prompt wrapper does for the
            quiz page's own word display. */}
        <div className="word-tile__word" ref={wordRef}>
          <FuriganaWord furigana={entry.furigana} />
        </div>
        <div className="word-tile__definition" ref={definitionRef}>
          {entry.definition}
        </div>
      </div>
    </div>
  );
}

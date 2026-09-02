import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/shared/Button';
import { useNextLessons } from '@/hooks/useNextLessons';
import { cx } from '@/utils/cx';
import '@/pages/Home/Page.scss';

// Display metadata for each backend lesson type (OvermindAPI's
// tango/modernQuiz/lessonPools.js LessonType) — which of these actually
// show up, and in what order, comes from useNextLessons per user/load;
// this is just how to render whichever ones do.
const LESSON_METADATA_BY_LESSON_TYPE = {
  new_words: {
    type: 'star',
    emoji: '⭐',
    title: 'New Words',
    subtitle: "Explore the wild unknown",
  },
  level_up: {
    type: 'gem',
    emoji: '💎',
    title: 'Level Up',
    subtitle: 'Focus on mastery',
  },
  fix_mistakes: {
    type: 'fire',
    emoji: '🔥',
    title: 'Fix Mistakes',
    subtitle: "Get good",
  },
  kanji_spotlight: {
    type: 'flashlight',
    emoji: '🔦',
    title: 'Kanji Spotlight',
    subtitle: 'One kanji, many words',
  },
};

export function HomePage() {
  const navigate = useNavigate();
  const { nextLessons } = useNextLessons();
  const unlockedLessons = useMemo(
    () =>
      nextLessons
        .map(({ type: lessonType }) => {
          const metadata = LESSON_METADATA_BY_LESSON_TYPE[lessonType];
          return metadata ? { ...metadata, lessonType } : null;
        })
        .filter(Boolean),
    [nextLessons],
  );
  const [selected, setSelected] = useState(null);
  const [hoveredType, setHoveredType] = useState(null);
  const [arrowX, setArrowX] = useState(null);
  const [lines, setLines] = useState([]);
  // The solid selection line, as a small list of independently-animating
  // instances — { id, type, visible } — rather than one line that gets
  // swapped in place. Switching tiles needs the old target's line fading
  // out at the same time the new target's line fades in, which one shared
  // element can't do (its opacity can only be one value at a time); two
  // separate elements crossfading past each other can. Each instance
  // removes itself once its own fade-out transition ends.
  const [lineEntries, setLineEntries] = useState([]);
  const nextLineEntryIdRef = useRef(0);
  const boardRef = useRef(null);
  const tilesWrapRef = useRef(null);
  const raccoonRef = useRef(null);
  const tileRefs = useRef({});

  // Tapping/clicking outside a tile or the preview card closes it, same as
  // Escape. Checked against those two specifically, not "outside boardRef"
  // — the flex containers' own box covers the gaps between the raccoon
  // tile and the row (and between the tiles themselves), so a click landing
  // in that dead space is still a DOM descendant of boardRef even though it
  // looks like background; that previously made a chunk of the page inert.
  useEffect(() => {
    if (!selected) return;

    function handlePointerDown(e) {
      if (!e.target.closest('.home-tile, .home-preview, .home-preview-arrow')) setSelected(null);
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setSelected(null);
    }
    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selected]);

  // The preview stays centered under the whole tile row (see .home-preview),
  // but the arrow points at whichever tile is actually selected — measured
  // off the DOM since tile position depends on the responsive breakpoint's
  // width/gap, not something worth hand-computing here. Relative to
  // tilesWrapRef, not boardRef, since that's the arrow's own positioned
  // ancestor (its `left` is a plain pixel offset within that box).
  useLayoutEffect(() => {
    if (!selected) return;

    function measure() {
      const wrapEl = tilesWrapRef.current;
      const tileEl = tileRefs.current[selected.type];
      if (!wrapEl || !tileEl) return;
      const wrapRect = wrapEl.getBoundingClientRect();
      const tileRect = tileEl.getBoundingClientRect();
      setArrowX(tileRect.left + tileRect.width / 2 - wrapRect.left);
    }

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [selected]);

  // Connector lines run from the raccoon tile's center to each lesson
  // tile's center, in board-relative pixels — measured off the DOM (same
  // reasoning as the arrow above) rather than assumed from the CSS layout.
  // The tiles themselves paint over the line endpoints (see z-index in
  // Page.scss), so the lines read as running behind them. Re-measures
  // whenever unlockedLessons changes since tiles don't exist yet on first
  // paint — useNextLessons's fetch hasn't resolved.
  useLayoutEffect(() => {
    function measure() {
      const boardEl = boardRef.current;
      const raccoonEl = raccoonRef.current;
      if (!boardEl || !raccoonEl) return;
      const boardRect = boardEl.getBoundingClientRect();
      const raccoonRect = raccoonEl.getBoundingClientRect();
      const originX = raccoonRect.left + raccoonRect.width / 2 - boardRect.left;
      const originY = raccoonRect.top + raccoonRect.height / 2 - boardRect.top;

      const nextLines = unlockedLessons.map((lesson) => {
        const tileEl = tileRefs.current[lesson.type];
        if (!tileEl) return null;
        const tileRect = tileEl.getBoundingClientRect();
        return {
          type: lesson.type,
          x1: originX,
          y1: originY,
          x2: tileRect.left + tileRect.width / 2 - boardRect.left,
          y2: tileRect.top + tileRect.height / 2 - boardRect.top,
        };
      }).filter(Boolean);

      setLines(nextLines);
    }

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [unlockedLessons]);

  // Whenever `selected` changes, every currently-shown line entry starts
  // fading out (each removes itself on its own transitionend, below), and —
  // unless this was a plain deselect — a new entry is added for the new
  // target so it fades in over the same span, instead of waiting for the
  // old one to finish first. It starts hidden; flipping it visible is
  // deferred two frames so the browser actually paints that hidden state
  // before the transition starts (a single rAF can still fire before that
  // paint happens, coalescing straight to visible with no transition).
  useEffect(() => {
    const nextType = selected?.type ?? null;

    setLineEntries((entries) => entries.map((entry) => ({ ...entry, visible: false })));
    if (nextType === null) return;

    const id = nextLineEntryIdRef.current++;
    setLineEntries((entries) => [...entries, { id, type: nextType, visible: false }]);

    let secondFrame;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        setLineEntries((entries) => entries.map((entry) => (entry.id === id ? { ...entry, visible: true } : entry)));
      });
    });
    return () => {
      cancelAnimationFrame(firstFrame);
      if (secondFrame) cancelAnimationFrame(secondFrame);
    };
  }, [selected]);

  function handleLineEntryTransitionEnd(id, e) {
    if (e.propertyName !== 'opacity') return;
    setLineEntries((entries) => {
      const entry = entries.find((en) => en.id === id);
      if (!entry || entry.visible) return entries; // only clean up a completed fade-out
      return entries.filter((en) => en.id !== id);
    });
  }

  return (
    <>
      <Helmet>
        <title>Tanuki Tango</title>
        <meta name="description" content="Tanuki Tango — Japanese learning track." />
      </Helmet>

      <div className="home-page">
        <div className="home-board" ref={boardRef}>
          <svg className="home-lines" aria-hidden>
            {lines.map((line) => (
              <line
                key={line.type}
                x1={line.x1}
                y1={line.y1}
                x2={line.x2}
                y2={line.y2}
                className={cx('home-lines__line', hoveredType === line.type && 'home-lines__line--active')}
              />
            ))}
            {lineEntries.map((entry) => {
              const line = lines.find((l) => l.type === entry.type);
              if (!line) return null;
              return (
                <line
                  key={entry.id}
                  x1={line.x1}
                  y1={line.y1}
                  x2={line.x2}
                  y2={line.y2}
                  className={cx('home-lines__solid', entry.visible && 'home-lines__solid--visible')}
                  onTransitionEnd={(e) => handleLineEntryTransitionEnd(entry.id, e)}
                />
              );
            })}
          </svg>

          <div className="home-raccoon-row">
            <div className="home-raccoon-tile" ref={raccoonRef} aria-hidden>
              🦝
            </div>
          </div>

          <div className="home-tiles-wrap" ref={tilesWrapRef}>
            <div className="home-tiles">
              {unlockedLessons.map((lesson) => (
                <button
                  key={lesson.type}
                  type="button"
                  ref={(el) => {
                    tileRefs.current[lesson.type] = el;
                  }}
                  className={cx(
                    'home-tile',
                    `home-tile--${lesson.type}`,
                    selected?.type === lesson.type && 'home-tile--selected',
                  )}
                  aria-pressed={selected?.type === lesson.type}
                  onClick={() => setSelected((prev) => (prev?.type === lesson.type ? null : lesson))}
                  onMouseEnter={() => setHoveredType(lesson.type)}
                  onMouseLeave={() => setHoveredType((prev) => (prev === lesson.type ? null : prev))}
                >
                  {lesson.emoji}
                </button>
              ))}
            </div>

            {selected && (
              <>
                <div className="home-preview-arrow" style={{ left: `${arrowX}px` }} aria-hidden />
                <div className="home-preview" role="dialog" aria-label={selected.title}>
                  <h2 className="home-preview__title">{selected.title}</h2>
                  <p className="home-preview__subtitle">{selected.subtitle}</p>
                  <Button onClick={() => navigate(`/lesson?type=${selected.lessonType}`)}>Start Lesson</Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

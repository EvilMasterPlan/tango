import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/shared/Button';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { useNextLessons } from '@/hooks/useNextLessons';
import { useOverallStats } from '@/hooks/useOverallStats';
import { useMinimumLoadingDuration } from '@/hooks/useMinimumLoadingDuration';
import { cx } from '@/utils/cx';
import { HomeHeader } from '@/pages/Home/HomeHeader';
import '@/pages/Home/Page.scss';

// Display metadata for each backend lesson type (OvermindAPI's
// tango/modernQuiz/lessonPools.js LessonType) — which of these actually
// show up, and in what order, comes from useNextLessons per user/load;
// this is just how to render whichever ones do. `icon` is a single bold
// kanji rather than an emoji — plain text, so .home-tile__icon can tint it
// to the tile's own --tile-accent color (see Page.scss), which an emoji
// glyph (rendered by the system's color emoji font, ignoring CSS `color`)
// couldn't be.
const LESSON_METADATA_BY_LESSON_TYPE = {
  new_words: {
    type: 'star',
    icon: '新',
    title: 'New Words',
    subtitle: "Explore the wild unknown",
  },
  level_up: {
    type: 'gem',
    icon: '強',
    title: 'Level Up',
    subtitle: 'Focus on mastery',
  },
  fix_mistakes: {
    type: 'fire',
    icon: '正',
    title: 'Fix Mistakes',
    subtitle: "Get good",
  },
  kanji_spotlight: {
    type: 'flashlight',
    icon: '字',
    title: 'Kanji Spotlight',
    subtitle: 'One kanji, many words',
  },
};

function buildTiles(options) {
  return options
    .map((lessonType) => {
      const metadata = LESSON_METADATA_BY_LESSON_TYPE[lessonType];
      return metadata ? { ...metadata, lessonType } : null;
    })
    .filter(Boolean);
}

// Tile refs/lines are keyed per-row, not just by display type — the same
// lesson type can legitimately show up in more than one row (a history row
// and the current one, or two history rows), so `type` alone isn't unique
// once there's more than one row on screen.
function tileKey(rowKey, tileType) {
  return `${rowKey}::${tileType}`;
}

export function HomePage() {
  const navigate = useNavigate();
  const { current, history, isLoading: isLessonsLoading } = useNextLessons();
  const { points, isLoading: isStatsLoading } = useOverallStats();
  const showLoading = useMinimumLoadingDuration(isLessonsLoading || isStatsLoading);

  // Oldest-first: up to 5 completed history rows, then the live current row
  // last. Every row but the last is guaranteed to have a completed lesson
  // (see OvermindAPI's lessonChoices.js getOrCreateLessonChoices — a new
  // row only ever gets created once the previous one's lesson is done), so
  // only the last row is ever interactive; the rest are a fixed record of
  // what was offered and picked.
  const rows = useMemo(() => {
    const historyRows = [...(history || [])].reverse();
    const ordered = current ? [...historyRows, current] : historyRows;
    return ordered.map((row, index) => ({
      key: row.id || `row-${index}`,
      id: row.id,
      selectedType: row.selectedType,
      isCurrent: index === ordered.length - 1,
      tiles: buildTiles(row.options),
    }));
  }, [current, history]);

  const currentRow = rows.length > 0 ? rows[rows.length - 1] : null;

  const [selected, setSelected] = useState(null);
  const [hoveredKey, setHoveredKey] = useState(null);
  // The selected tile's own line key — kept lit independent of hover, and
  // regardless of what else gets hovered afterward, until deselected (see
  // the line's className below, and setSelected's toggle-off on a repeat
  // click / outside click / Escape).
  const selectedKey = selected && currentRow ? tileKey(currentRow.key, selected.type) : null;
  function isLineActive(line) {
    return line.alwaysActive || hoveredKey === line.key || selectedKey === line.key;
  }
  const [arrowX, setArrowX] = useState(null);
  const [lines, setLines] = useState([]);
  const contentRef = useRef(null);
  const boardRef = useRef(null);
  const currentTilesWrapRef = useRef(null);
  const tileRefs = useRef({});

  // Tapping/clicking outside a tile or the preview card closes it, same as
  // Escape. Checked against those two specifically, not "outside boardRef"
  // — the flex containers' own box covers the gaps between the tile rows,
  // so a click landing in that dead space is still a DOM descendant of
  // boardRef even though it looks like background; that previously made a
  // chunk of the page inert.
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

  // Positions .home-board's bottom edge so the current row's own center —
  // not the whole board's — sits at the right height. Default (little/no
  // history) is dead center of .home-content, controlled by
  // --home-next-row-initial-position. As history rows accumulate
  // above it, the current row is pushed down just enough to keep them all
  // visible, up to --home-next-row-max-position — beyond that, it
  // holds there and additional history simply runs off the top into the
  // fade/clip instead of pushing the current row any further. Runs before
  // the arrow/line-measuring effects below since they read the board's
  // on-screen position, which this effect changes.
  //
  // currentEl.offsetTop/offsetHeight describe its position *within* boardEl
  // (its offsetParent, the nearest positioned ancestor) — unaffected by
  // boardEl's own `bottom`, so these can be read before (and used to
  // compute) that value with no circularity.
  useLayoutEffect(() => {
    function position() {
      const boardEl = boardRef.current;
      const contentEl = contentRef.current;
      const currentEl = currentTilesWrapRef.current;
      if (!boardEl || !contentEl || !currentEl) return;

      const containerHeight = contentEl.clientHeight;
      const rowHeight = currentEl.offsetHeight;
      const historyHeight = currentEl.offsetTop;

      const contentStyle = getComputedStyle(contentEl);
      const initialFraction = parseFloat(contentStyle.getPropertyValue('--home-next-row-initial-position')) || 0.5;
      const maxFraction = parseFloat(contentStyle.getPropertyValue('--home-next-row-max-position')) || 0.85;

      const idealCenterY = historyHeight + rowHeight / 2;
      const centerY = Math.min(Math.max(idealCenterY, initialFraction * containerHeight), maxFraction * containerHeight);
      const bottomOffset = containerHeight - centerY - rowHeight / 2;

      boardEl.style.setProperty('--home-board-bottom', `${bottomOffset}px`);
    }

    position();
    window.addEventListener('resize', position);
    return () => window.removeEventListener('resize', position);
  }, [rows]);

  // The preview stays centered under the current row (see .home-preview),
  // but the arrow points at whichever tile is actually selected — measured
  // off the DOM since tile position depends on the responsive breakpoint's
  // width/gap, not something worth hand-computing here. Relative to
  // currentTilesWrapRef, not boardRef, since that's the arrow's own
  // positioned ancestor (its `left` is a plain pixel offset within that box).
  useLayoutEffect(() => {
    if (!selected || !currentRow) return;

    function measure() {
      const wrapEl = currentTilesWrapRef.current;
      const tileEl = tileRefs.current[tileKey(currentRow.key, selected.type)];
      if (!wrapEl || !tileEl) return;
      const wrapRect = wrapEl.getBoundingClientRect();
      const tileRect = tileEl.getBoundingClientRect();
      setArrowX(tileRect.left + tileRect.width / 2 - wrapRect.left);
    }

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [selected, currentRow]);

  // Connector lines run in board-relative pixels, measured off the DOM (same
  // reasoning as the arrow above). There's no fixed hub anymore (no raccoon
  // tile) — the topmost row simply has no incoming lines (a first-time
  // user, with only their one current row, sees no lines at all), and every
  // row after the first is fed from the *previous* row's chosen tile.
  // Within a history row, that's the *only* line drawn — its unchosen
  // options are bygone, not live branches — so only the current (last, still
  // interactive) row ever fans out to more than one tile.
  //
  // Each connector is an elbow, not a straight diagonal: down from the
  // origin to the midpoint between the two rows, across to the destination
  // tile's x, then down into it — built as a 4-point polyline rather than a
  // <line>. For a fan-out (3+ destinations sharing one origin), every one of
  // those polylines starts at the *exact same* (origin.x, origin.y) and
  // travels the *exact same* vertical-then-horizontal path up to the point
  // each one's own branch peels off downward — so their shared portion
  // draws pixel-for-pixel on top of itself and reads as one merged segment,
  // with no need to compute/render that shared bus separately.
  //
  // Re-measures whenever `rows` changes since tiles don't exist yet on
  // first paint — useNextLessons's fetch hasn't resolved.
  useLayoutEffect(() => {
    function measure() {
      const boardEl = boardRef.current;
      if (!boardEl) return;
      const boardRect = boardEl.getBoundingClientRect();

      function centerOf(el) {
        const rect = el.getBoundingClientRect();
        return { x: rect.left + rect.width / 2 - boardRect.left, y: rect.top + rect.height / 2 - boardRect.top };
      }

      let origin = null;
      const nextLines = [];

      rows.forEach((row) => {
        const chosenTile = row.tiles.find((tile) => tile.lessonType === row.selectedType);
        const chosenEl = chosenTile && tileRefs.current[tileKey(row.key, chosenTile.type)];

        if (origin) {
          const targetTiles = row.isCurrent ? row.tiles : chosenTile ? [chosenTile] : [];
          targetTiles.forEach((tile) => {
            const tileEl = tileRefs.current[tileKey(row.key, tile.type)];
            if (!tileEl) return;
            const center = centerOf(tileEl);
            const midY = (origin.y + center.y) / 2;
            nextLines.push({
              key: tileKey(row.key, tile.type),
              // A line into a history row is a settled, already-made pick
              // (it can only be its chosen tile — see targetTiles above),
              // not a live option — always lit, not hover/select-driven.
              alwaysActive: !row.isCurrent,
              points: [
                [origin.x, origin.y],
                [origin.x, midY],
                [center.x, midY],
                [center.x, center.y],
              ],
            });
          });
        }

        origin = chosenEl ? centerOf(chosenEl) : null;
      });

      setLines(nextLines);
    }

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [rows]);

  return (
    <>
      <Helmet>
        <title>Tanuki Tango</title>
        <meta name="description" content="Tanuki Tango — Japanese learning track." />
      </Helmet>

      <div className="home-page">
        <HomeHeader points={points} />

        <div className="home-content" ref={contentRef}>
          <div className="home-board" ref={boardRef}>
            {/* Two stacked, stable-order passes rather than one set reordered
                by active-ness: a fan-out's lines share an identical leading
                segment (the trunk and the run across to wherever each one's
                own branch peels off), and SVG has no z-index for siblings —
                paint order is purely DOM order. Reordering *which* line comes
                last so the active one paints on top works, but moving DOM
                nodes around every hover flickers in some browsers. Instead,
                every line renders twice at the same fixed position in the
                tree — a permanent grey base, and a permanent white overlay
                directly on top of it that just fades its own opacity in/out
                (see .home-lines__line--overlay) — so nothing ever needs to
                move, only fade. */}
            <svg className="home-lines" aria-hidden>
              {lines.map((line) => (
                <polyline key={line.key} points={line.points.map(([x, y]) => `${x},${y}`).join(' ')} className="home-lines__line" />
              ))}
              {lines.map((line) => (
                <polyline
                  key={`${line.key}-overlay`}
                  points={line.points.map(([x, y]) => `${x},${y}`).join(' ')}
                  className={cx('home-lines__line', 'home-lines__line--overlay', isLineActive(line) && 'home-lines__line--overlay-visible')}
                />
              ))}
            </svg>

            {rows.map((row) => (
              <div
                className={cx('home-tiles-wrap', row.isCurrent && rows.length > 1 && 'home-tiles-wrap--current')}
                key={row.key}
                ref={row.isCurrent ? currentTilesWrapRef : null}
              >
                <div className="home-tiles">
                  {row.tiles.map((tile) => {
                    const isChosen = row.selectedType === tile.lessonType;

                    if (!row.isCurrent) {
                      return (
                        <div
                          key={tile.type}
                          ref={(el) => {
                            tileRefs.current[tileKey(row.key, tile.type)] = el;
                          }}
                          className={cx('home-tile', `home-tile--${tile.type}`, 'home-tile--history', isChosen && 'home-tile--chosen')}
                        >
                          <span className="home-tile__icon">{tile.icon}</span>
                        </div>
                      );
                    }

                    const key = tileKey(row.key, tile.type);
                    return (
                      <button
                        key={tile.type}
                        type="button"
                        ref={(el) => {
                          tileRefs.current[key] = el;
                        }}
                        className={cx(
                          'home-tile',
                          `home-tile--${tile.type}`,
                          selected?.type === tile.type && 'home-tile--selected',
                        )}
                        aria-pressed={selected?.type === tile.type}
                        onClick={() => setSelected((prev) => (prev?.type === tile.type ? null : tile))}
                        onMouseEnter={() => setHoveredKey(key)}
                        onMouseLeave={() => setHoveredKey((prev) => (prev === key ? null : prev))}
                      >
                        <span className="home-tile__icon">{tile.icon}</span>
                      </button>
                    );
                  })}
                </div>

                {row.isCurrent && selected && (
                  <>
                    <div className="home-preview-arrow" style={{ left: `${arrowX}px` }} aria-hidden />
                    <div className="home-preview" role="dialog" aria-label={selected.title}>
                      <h2 className="home-preview__title">{selected.title}</h2>
                      <p className="home-preview__subtitle">{selected.subtitle}</p>
                      <Button
                        onClick={() => {
                          const choiceParam = currentRow?.id ? `&choice=${currentRow.id}` : '';
                          navigate(`/lesson?type=${selected.lessonType}${choiceParam}`);
                        }}
                      >
                        Start Lesson
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <LoadingOverlay active={showLoading} />
      </div>
    </>
  );
}

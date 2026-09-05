import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/shared/Button';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { useNextLessons } from '@/hooks/useNextLessons';
import { modernQuizApi } from '@/utils/api/modernQuiz';
import { useOverallStats } from '@/hooks/useOverallStats';
import { useMinimumLoadingDuration } from '@/hooks/useMinimumLoadingDuration';
import { cx } from '@/utils/cx';
import { HomeHeader } from '@/pages/Home/HomeHeader';
import '@/pages/Home/Page.scss';

// Display metadata for each backend lesson type — which of these actually
// show up, and in what order, comes from useNextLessons per user/load;
// this is just how to render whichever ones do. Keyed by the same lesson
// type string used for CSS class suffixes and tile/ref keys below, so
// there's one name per lesson type. `icon` is a single bold kanji rendered
// as plain text, so .home-tile__icon can tint it with CSS color to the
// tile's own accent.
const LESSON_METADATA_BY_LESSON_TYPE = {
  new_words: {
    icon: '新',
    title: 'New Words',
    subtitle: "Explore the wild unknown",
  },
  level_up: {
    icon: '強',
    title: 'Level Up',
    subtitle: 'Focus on mastery',
  },
  fix_mistakes: {
    icon: '正',
    title: 'Fix Mistakes',
    subtitle: "Get good",
  },
  kanji_spotlight: {
    icon: '字',
    title: 'Kanji Spotlight',
    subtitle: 'They contain multitudes',
  },
  from_the_top: {
    icon: '頭',
    title: 'From the Top',
    subtitle: 'Back to basics',
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

// Tile refs/lines are keyed per-row, not just by lesson type — the same
// lesson type can legitimately show up in more than one row (a history row
// and the current one, or two history rows), so lessonType alone isn't
// unique once there's more than one row on screen.
function tileKey(rowKey, tileType) {
  return `${rowKey}::${tileType}`;
}

// Where the "hole" (see .home-hole) ends within the gap between the last
// history row and the current row below it — 0 would stop it flush with
// the history row's own bottom edge, 1 flush with the current row's top
// edge. 0.75 leaves it mostly closed, just short of the current row.
const HOLE_BOTTOM_GAP_FRACTION = 0.75;

// How far above the current row's top edge the "hole" stops when there's no
// history row to split the gap with — ensures a first-time user with only
// their one current row still gets a shallow dip behind it.
const HOLE_MIN_GAP_ABOVE_CURRENT_PX = 32;

// The visible gap between a tile row and the preview card next to it (see
// .home-preview's top/bottom) — used to check whether the card actually
// fits on its default (below) side before flipping above.
const PREVIEW_GAP_PX = 12;

export function HomePage() {
  const navigate = useNavigate();
  const { current, history, isLoading: isLessonsLoading } = useNextLessons();
  const { points, isLoading: isStatsLoading } = useOverallStats();
  const showLoading = useMinimumLoadingDuration(isLessonsLoading || isStatsLoading);

  // Oldest-first: up to 5 completed history rows, then the live current row
  // last. Every row but the last is guaranteed to have a completed lesson —
  // a new row is only ever created once the previous one's lesson is done —
  // so only the last row is ever interactive; the rest are a fixed record
  // of what was offered and picked.
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
  const selectedKey = selected && currentRow ? tileKey(currentRow.key, selected.lessonType) : null;
  function isLineActive(line) {
    return line.alwaysActive || hoveredKey === line.key || selectedKey === line.key;
  }

  // True from click until the choice is recorded (or fails) and navigation
  // fires — guards against a double Enter/click firing two overlapping
  // selectLessonChoice calls while the first is still in flight.
  const [isStartingLesson, setIsStartingLesson] = useState(false);

  // Shared by the preview card's "Start Lesson" button and the Enter
  // shortcut below. Records the picked tile against the user's current
  // lesson-choice row before navigating, so /lesson itself needs no query
  // params — the lesson-generation endpoint reads the same row back
  // server-side. currentRow?.id is absent only when there's no real row to
  // record against, and a failed record still lets the lesson start — the
  // endpoint just falls back to its own default type, same as an
  // unrecorded choice always has.
  async function startSelectedLesson() {
    if (!selected || isStartingLesson) return;
    setIsStartingLesson(true);
    try {
      if (currentRow?.id) {
        await modernQuizApi.selectLessonChoice(currentRow.id, selected.lessonType);
      }
    } catch (error) {
      console.warn('Failed to record lesson choice selection:', error);
    } finally {
      setIsStartingLesson(false);
    }
    navigate('/lesson');
  }
  const [arrowX, setArrowX] = useState(null);
  // Which side of the tile row the preview card renders on — see the
  // arrow/preview-positioning effect below, which flips this to 'above'
  // whenever the card doesn't fit below within .home-content.
  const [previewPlacement, setPreviewPlacement] = useState('below');
  const [lines, setLines] = useState([]);
  const contentRef = useRef(null);
  const holeRef = useRef(null);
  const boardRef = useRef(null);
  const currentTilesWrapRef = useRef(null);
  const previewRef = useRef(null);
  const tileRefs = useRef({});

  // Tapping/clicking outside a tile or the preview card closes it, same as
  // Escape; Enter instead confirms, same as clicking "Start Lesson". Outside
  // checked against those two specifically, not "outside boardRef" — the
  // flex containers' own box covers the gaps between the tile rows, so a
  // click landing in that dead space is still a DOM descendant of boardRef
  // even though it looks like background.
  useEffect(() => {
    if (!selected) return;

    function handlePointerDown(e) {
      if (!e.target.closest('.home-tile, .home-preview, .home-preview-arrow')) setSelected(null);
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') setSelected(null);
      else if (e.key === 'Enter') startSelectedLesson();
    }
    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selected, currentRow]);

  // Positions .home-board's bottom edge so the current row's own center —
  // not the whole board's — sits at the right height. Default (little/no
  // history) is dead center of .home-content. As history rows accumulate
  // above it, the current row is pushed down just enough to keep them all
  // visible, up to a configured maximum — beyond that, it holds there and
  // additional history simply runs off the top into the fade/clip. Runs
  // before the arrow/line-measuring effects below since they read the
  // board's on-screen position, which this effect changes.
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

  // Sizes the "dug hole" that history rows appear to sit inside — its
  // width tracks the board's own natural width (the widest row), and its
  // height runs from the top of .home-content down to
  // HOLE_BOTTOM_GAP_FRACTION of the way through the gap between the last
  // history row and the current row below it (0.75 — mostly closed, so the
  // hole reads as ending just shy of the current row), or, with no history
  // yet, to a fixed short gap above the current row
  // (HOLE_MIN_GAP_ABOVE_CURRENT_PX). Reads on-screen rects, so this must
  // run after the board-positioning effect above has settled the board's
  // position for this render.
  useLayoutEffect(() => {
    function size() {
      const boardEl = boardRef.current;
      const contentEl = contentRef.current;
      const currentEl = currentTilesWrapRef.current;
      const holeEl = holeRef.current;
      if (!boardEl || !contentEl || !currentEl || !holeEl) return;

      const contentTop = contentEl.getBoundingClientRect().top;
      const currentTop = currentEl.getBoundingClientRect().top;

      // The board's children are the lines <svg> (always first), then one
      // wrap per row in order, current row last — so the second-to-last
      // child is the most recent history row's wrap, when one exists.
      const historyEls = Array.from(boardEl.children).slice(1, -1);
      const lastHistoryEl = historyEls[historyEls.length - 1];

      let holeBottom;
      if (lastHistoryEl) {
        const lastHistoryBottom = lastHistoryEl.getBoundingClientRect().bottom;
        holeBottom = lastHistoryBottom + (currentTop - lastHistoryBottom) * HOLE_BOTTOM_GAP_FRACTION;
      } else {
        holeBottom = currentTop - HOLE_MIN_GAP_ABOVE_CURRENT_PX;
      }

      holeEl.style.setProperty('--home-hole-height', `${Math.max(holeBottom - contentTop, 0)}px`);
      holeEl.style.setProperty('--home-hole-board-width', `${boardEl.offsetWidth}px`);
    }

    size();
    window.addEventListener('resize', size);
    return () => window.removeEventListener('resize', size);
  }, [rows]);

  // The preview stays centered under the current row (see .home-preview),
  // but the arrow points at whichever tile is actually selected — measured
  // off the DOM since tile position depends on the responsive breakpoint's
  // width/gap, not something worth hand-computing here. Relative to
  // currentTilesWrapRef, not boardRef, since that's the arrow's own
  // positioned ancestor (its `left` is a plain pixel offset within that box).
  //
  // Also decides which side of the row the card renders on: below by
  // default, flipped above whenever it doesn't actually fit below within
  // .home-content (e.g. the current row sitting near the bottom of the
  // page). previewRef's height is read regardless of which side it's
  // currently anchored to, since that's purely a `top`/`bottom` offset —
  // its intrinsic content height doesn't change with placement.
  useLayoutEffect(() => {
    if (!selected || !currentRow) return;

    function measure() {
      const wrapEl = currentTilesWrapRef.current;
      const tileEl = tileRefs.current[tileKey(currentRow.key, selected.lessonType)];
      const previewEl = previewRef.current;
      const contentEl = contentRef.current;
      if (!wrapEl || !tileEl || !previewEl || !contentEl) return;

      const wrapRect = wrapEl.getBoundingClientRect();
      const tileRect = tileEl.getBoundingClientRect();
      setArrowX(tileRect.left + tileRect.width / 2 - wrapRect.left);

      const contentRect = contentEl.getBoundingClientRect();
      const neededSpace = previewEl.offsetHeight + PREVIEW_GAP_PX;
      const fitsBelow = contentRect.bottom - wrapRect.bottom >= neededSpace;
      setPreviewPlacement(fitsBelow ? 'below' : 'above');
    }

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [selected, currentRow]);

  // Connector lines run in board-relative pixels, measured off the DOM
  // (same reasoning as the arrow above). The topmost row simply has no
  // incoming lines (a first-time user, with only their one current row,
  // sees no lines at all), and every row after the first is fed from the
  // *previous* row's chosen tile. Within a history row, that's the *only*
  // line drawn — its unchosen options are bygone, not live branches — so
  // only the current (last, still interactive) row ever fans out to more
  // than one tile.
  //
  // Each connector is an elbow: down from the origin to the midpoint
  // between the two rows, across to the destination tile's x, then down
  // into it — built as a 4-point polyline. For a fan-out (3+ destinations
  // sharing one origin), every one of those polylines starts at the
  // *exact same* (origin.x, origin.y) and travels the *exact same*
  // vertical-then-horizontal path up to the point each one's own branch
  // peels off downward — so their shared portion draws pixel-for-pixel on
  // top of itself and reads as one merged segment, with no need to
  // compute/render that shared bus separately.
  //
  // Re-measures whenever `rows` changes since tiles don't exist yet on
  // first paint, before the initial fetch resolves.
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
        const chosenEl = chosenTile && tileRefs.current[tileKey(row.key, chosenTile.lessonType)];

        if (origin) {
          const targetTiles = row.isCurrent ? row.tiles : chosenTile ? [chosenTile] : [];
          targetTiles.forEach((tile) => {
            const tileEl = tileRefs.current[tileKey(row.key, tile.lessonType)];
            if (!tileEl) return;
            const center = centerOf(tileEl);
            const midY = (origin.y + center.y) / 2;
            nextLines.push({
              key: tileKey(row.key, tile.lessonType),
              // A line into a history row is a settled, already-made pick
              // (it can only be its chosen tile), so it's always lit
              // regardless of hover/selection.
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
          {/* Clips history rows that overflow above the current one. */}
          <div className="home-clip">
            <div className="home-hole" ref={holeRef} aria-hidden />

            <div className="home-board" ref={boardRef}>
              {/* Two stacked, stable-order passes: a fan-out's lines share an
                  identical leading segment (the trunk and the run across to
                  wherever each one's own branch peels off), and SVG has no
                  z-index for siblings — paint order is purely DOM order.
                  Every line renders twice at the same fixed position in the
                  tree — a permanent grey base, and a permanent white overlay
                  directly on top of it that just fades its own opacity
                  in/out — so nothing ever needs to move, only fade. */}
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
                            key={tile.lessonType}
                            ref={(el) => {
                              tileRefs.current[tileKey(row.key, tile.lessonType)] = el;
                            }}
                            className={cx('home-tile', `home-tile--${tile.lessonType}`, 'home-tile--history', isChosen && 'home-tile--chosen')}
                          >
                            <span className="home-tile__icon">{tile.icon}</span>
                          </div>
                        );
                      }

                      const key = tileKey(row.key, tile.lessonType);
                      return (
                        <button
                          key={tile.lessonType}
                          type="button"
                          ref={(el) => {
                            tileRefs.current[key] = el;
                          }}
                          className={cx(
                            'home-tile',
                            `home-tile--${tile.lessonType}`,
                            selected?.lessonType === tile.lessonType && 'home-tile--selected',
                          )}
                          aria-pressed={selected?.lessonType === tile.lessonType}
                          onClick={() => setSelected((prev) => (prev?.lessonType === tile.lessonType ? null : tile))}
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
                      <div
                        className={cx('home-preview-arrow', `home-preview-arrow--${previewPlacement}`)}
                        style={{ left: `${arrowX}px` }}
                        aria-hidden
                      />
                      <div
                        className={cx('home-preview', `home-preview--${previewPlacement}`)}
                        role="dialog"
                        aria-label={selected.title}
                        ref={previewRef}
                      >
                        <h2 className="home-preview__title">{selected.title}</h2>
                        <p className="home-preview__subtitle">{selected.subtitle}</p>
                        <Button onClick={startSelectedLesson} disabled={isStartingLesson}>Start Lesson</Button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <LoadingOverlay active={showLoading} />
      </div>
    </>
  );
}

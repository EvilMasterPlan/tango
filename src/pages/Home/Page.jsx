import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/shared/Button';
import { LoadingOverlay } from '@/components/shared/LoadingOverlay';
import { Tile } from '@/components/shared/Tile';
import { useNextLessons } from '@/hooks/useNextLessons';
import { useOverallStats } from '@/hooks/useOverallStats';
import { useMinimumLoadingDuration } from '@/hooks/useMinimumLoadingDuration';
import { cx } from '@/utils/cx';
import { HomeHeader } from '@/pages/Home/HomeHeader';
import { LESSON_METADATA_BY_LESSON_TYPE } from '@/utils/lessonTypeMetadata';
import '@/pages/Home/Page.scss';

// Which of LESSON_METADATA_BY_LESSON_TYPE's types actually show up here,
// and in what order, comes from useNextLessons per user/load — this just
// maps whichever ones do to their display metadata. `icon` is a single bold
// kanji rendered as plain text, passed to <Tile>'s own icon slot, which
// tints it with CSS color to the tile's accent.
function buildTiles(options) {
  return options
    .map((lessonType) => {
      const metadata = LESSON_METADATA_BY_LESSON_TYPE[lessonType];
      return metadata ? { ...metadata, lessonType } : null;
    })
    .filter(Boolean);
}

// The current row's tile refs/lines are keyed per-row, not just by lesson
// type — the same lesson type could otherwise collide if it ever showed up
// more than once on screen. Only needed for the current row's own 3
// options, though (guaranteed distinct — see buildNextLessons' own
// without-replacement sample): the snake's history tiles below key
// themselves directly by their own TANGO_Lessons row id instead, already
// globally unique on its own, since two snake tiles *can* legitimately
// share a lesson type (completing NEW_WORDS twice in a row, say) in a way a
// compound row+type key wouldn't disambiguate either.
function tileKey(rowKey, tileType) {
  return `${rowKey}::${tileType}`;
}

// How many tiles wide the history "snake" runs before wrapping up onto the
// next row — see the rows memo below.
const SNAKE_ROW_WIDTH = 3;

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

  // Most-recent-first (the order history already arrives in) — each entry
  // is one completed lesson (see the "snake" layout below). The API already
  // filters out a row whose lesson was never actually resolved against it
  // (e.g. an arbitrary lesson type started via Practice/Page.jsx while this
  // row was still pending, which never touches it at all). `perfect`/score/
  // incorrectCount/completedAt/params ride along unused by the snake itself
  // for now — carried through here rather than dropped so a later UI change
  // (e.g. a special treatment for a perfect-score tile) doesn't need its own
  // plumbing.
  const historyTileEntries = useMemo(() => {
    return (history || [])
      .map((row) => {
        const metadata = LESSON_METADATA_BY_LESSON_TYPE[row.lessonType];
        if (!metadata) return null;
        return {
          id: row.id,
          lessonType: row.lessonType,
          perfect: row.perfect,
          score: row.score,
          incorrectCount: row.incorrectCount,
          completedAt: row.completedAt,
          params: row.params,
          ...metadata,
        };
      })
      .filter(Boolean);
  }, [history]);

  // Lays historyTileEntries out as a SNAKE_ROW_WIDTH-wide, boustrophedon
  // ("ox-plowing") snake: starting at the bottom-right (closest to the
  // current row below it — the single most recently completed lesson),
  // running left to the row's far wall, then up a row and back right, then
  // up again and back left, and so on — reading like an old CRT's scanlines
  // turned on their side. Each row after the first always resumes from
  // directly above wherever the previous one ended, which is exactly what
  // keeps the zigzag connected rather than jumping side to side.
  //
  // Built bottom-up (rowIndex 0 = the row nearest current) since that's the
  // order the direction alternation and "resume where the last row left
  // off" logic naturally read in, then reversed once at the end for
  // rendering — .home-board stacks its children top-to-bottom, and the
  // oldest row (built last here) needs to come first in the DOM for that to
  // land in the right place on screen.
  //
  // A row's own tiles are filled starting from its entry corner and read
  // off in fill order below (rank order for an even/right-starting row,
  // rank order reversed — i.e. left to right — for an odd/left-starting
  // one), so the *last* row built (however many tiles it ends up with) can
  // be partially empty — its unfilled slots stay on whichever side its own
  // fill direction never reached, rendered as invisible spacers so every
  // row still lines up on the same SNAKE_ROW_WIDTH-column grid regardless
  // of how many tiles it actually holds.
  const rows = useMemo(() => {
    const snakeRowsBottomUp = [];
    for (let start = 0; start < historyTileEntries.length; start += SNAKE_ROW_WIDTH) {
      const rowIndex = snakeRowsBottomUp.length;
      const isEvenRow = rowIndex % 2 === 0;
      const chunk = historyTileEntries.slice(start, start + SNAKE_ROW_WIDTH);
      const emptySlots = Array(SNAKE_ROW_WIDTH - chunk.length).fill(null);
      // Even rows fill right-to-left (rank order is already right-to-left,
      // so flip it to get left-to-right reading order for rendering, with
      // empty slots left over on the left); odd rows fill left-to-right
      // (rank order already reads left-to-right as-is, empties left over on
      // the right).
      snakeRowsBottomUp.push(isEvenRow ? [...emptySlots, ...chunk.slice().reverse()] : [...chunk, ...emptySlots]);
    }

    const historyRows = snakeRowsBottomUp
      .slice()
      .reverse()
      .map((tiles, index) => ({
        key: `snake-row-${snakeRowsBottomUp.length - 1 - index}`,
        isCurrent: false,
        tiles,
      }));

    // Nothing persists "the current offer" server-side anymore (see
    // useNextLessons/getNextLessons) — it's just freshly derived options
    // every call, so there's no real row identity to key off of here either.
    const currentRow = current ? { key: 'current', isCurrent: true, tiles: buildTiles(current.options) } : null;
    return currentRow ? [...historyRows, currentRow] : historyRows;
  }, [current, historyTileEntries]);

  const currentRow = rows.length > 0 && rows[rows.length - 1].isCurrent ? rows[rows.length - 1] : null;

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

  // Shared by the preview card's "Start Lesson" button and the Enter
  // shortcut below. Sends the picked type straight to /lesson via
  // navigation state — the same mechanism Practice/Page.jsx's own explicit-
  // type lessons already use — rather than recording a pick against some
  // persisted row first; there's no such row anymore for generateLesson to
  // read back server-side.
  function startSelectedLesson() {
    if (!selected) return;
    navigate('/lesson', { state: { lessonType: selected.lessonType } });
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
      if (!e.target.closest('.shared-tile, .home-preview, .home-preview-arrow')) setSelected(null);
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

  // Sizes the "dug hole" that history rows appear to sit inside — its width
  // tracks the board's own natural width (the widest row), and its height
  // runs from the top of .home-content down to just past the last history
  // row's own bottom edge, padded by the same amount as the hole's left/
  // right padding (--home-hole-padding-x) so it reads as symmetric on all
  // three sides — or, with no history yet, to a fixed short gap above the
  // current row (HOLE_MIN_GAP_ABOVE_CURRENT_PX). Reads on-screen rects, so
  // this must run after the board-positioning effect above has settled the
  // board's position for this render.
  useLayoutEffect(() => {
    function size() {
      const boardEl = boardRef.current;
      const contentEl = contentRef.current;
      const currentEl = currentTilesWrapRef.current;
      const holeEl = holeRef.current;
      if (!boardEl || !contentEl || !currentEl || !holeEl) return;

      const contentTop = contentEl.getBoundingClientRect().top;
      const currentTop = currentEl.getBoundingClientRect().top;

      // Selected by attribute rather than DOM position — .home-board's
      // children also include the lines <svg> ahead of the row wraps, so a
      // fixed slice-off-the-ends offset isn't reliable here.
      const historyEls = Array.from(boardEl.querySelectorAll('.home-tiles-wrap:not([data-current])'));
      const lastHistoryEl = historyEls[historyEls.length - 1];

      let holeBottom;
      if (lastHistoryEl) {
        const holeStyle = getComputedStyle(holeEl);
        const paddingXRem = parseFloat(holeStyle.getPropertyValue('--home-hole-padding-x')) || 0;
        const rootFontSizePx = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
        holeBottom = lastHistoryEl.getBoundingClientRect().bottom + paddingXRem * rootFontSizePx;
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
  // (same reasoning as the arrow above). Two passes: a straight chain
  // through the snake itself (oldest to newest — the reverse of
  // historyTileEntries' own most-recent-first order — so it builds forward
  // through time same as the old per-row chain did), then, only at the very
  // end, a fan-out from the single most recent snake tile to every one of
  // the current row's own options — the only point that still branches,
  // since every earlier step of the snake is a settled 1-to-1 link, not a
  // choice among several.
  //
  // Each connector is an elbow: down from the origin to the midpoint
  // between the two tiles, across to the destination's x, then down into
  // it — built as a 4-point polyline, same as before. Two consecutive snake
  // tiles are always either same-row neighbors (identical y, so the elbow's
  // vertical segments collapse to nothing and it reads as a plain
  // horizontal line) or a row-transition pair at the shared turn column
  // (identical x, so the horizontal segment collapses instead and it reads
  // as a plain vertical line) — never a true diagonal — so this one shape
  // covers every link in the snake without needing to special-case either.
  //
  // Re-measures whenever `rows`/historyTileEntries change since tiles don't
  // exist yet on first paint, before the initial fetch resolves.
  useLayoutEffect(() => {
    function measure() {
      const boardEl = boardRef.current;
      if (!boardEl) return;
      const boardRect = boardEl.getBoundingClientRect();

      function centerOf(el) {
        const rect = el.getBoundingClientRect();
        return { x: rect.left + rect.width / 2 - boardRect.left, y: rect.top + rect.height / 2 - boardRect.top };
      }

      function elbow(origin, center) {
        const midY = (origin.y + center.y) / 2;
        return [
          [origin.x, origin.y],
          [origin.x, midY],
          [center.x, midY],
          [center.x, center.y],
        ];
      }

      const nextLines = [];
      let origin = null;

      [...historyTileEntries].reverse().forEach((entry) => {
        const el = tileRefs.current[entry.id];
        if (!el) {
          origin = null;
          return;
        }
        const center = centerOf(el);
        if (origin) {
          nextLines.push({ key: entry.id, alwaysActive: true, points: elbow(origin, center) });
        }
        origin = center;
      });

      if (origin && currentRow) {
        currentRow.tiles.forEach((tile) => {
          const key = tileKey(currentRow.key, tile.lessonType);
          const tileEl = tileRefs.current[key];
          if (!tileEl) return;
          // The fan-out into current is the one still-live choice — lit on
          // hover/selection rather than always, unlike every settled link
          // in the snake above.
          nextLines.push({ key, alwaysActive: false, points: elbow(origin, centerOf(tileEl)) });
        });
      }

      setLines(nextLines);
    }

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [rows, historyTileEntries, currentRow]);

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
                  data-current={row.isCurrent || undefined}
                  ref={row.isCurrent ? currentTilesWrapRef : null}
                >
                  <div className="home-tiles">
                    {row.tiles.map((tile, slotIndex) => {
                      if (!row.isCurrent) {
                        // A gap in the snake — this row didn't have enough
                        // tiles to fill every column (only ever the row
                        // furthest from current, see the rows memo above).
                        // An empty, unstyled spacer of the same footprint
                        // keeps every row on the same SNAKE_ROW_WIDTH-column
                        // grid regardless, which is what keeps the snake's
                        // own turns landing in the same place column to
                        // column.
                        if (!tile) {
                          return <div key={`empty-${slotIndex}`} className="home-tile-slot--empty" aria-hidden />;
                        }

                        return (
                          <Tile
                            as="div"
                            key={tile.id}
                            ref={(el) => {
                              tileRefs.current[tile.id] = el;
                            }}
                            accent={tile.lessonType}
                            icon={tile.icon}
                            history
                            chosen
                          />
                        );
                      }

                      const key = tileKey(row.key, tile.lessonType);
                      return (
                        <Tile
                          key={tile.lessonType}
                          ref={(el) => {
                            tileRefs.current[key] = el;
                          }}
                          accent={tile.lessonType}
                          icon={tile.icon}
                          selected={selected?.lessonType === tile.lessonType}
                          aria-pressed={selected?.lessonType === tile.lessonType}
                          onClick={() => setSelected((prev) => (prev?.lessonType === tile.lessonType ? null : tile))}
                          onMouseEnter={() => setHoveredKey(key)}
                          onMouseLeave={() => setHoveredKey((prev) => (prev === key ? null : prev))}
                        />
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
                        <Button onClick={startSelectedLesson}>Start Lesson</Button>
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

import { useEffect, useState } from 'react';
import { cx } from '@/utils/cx';
import './SpellingTiles.scss';

// Mirrors the fixed layout constants in SpellingTiles.scss / Quiz.scss so
// row capacity can be computed as a pure function of viewport width. If
// those .scss values change, update these too.
const MOBILE_BREAKPOINT = 768; // @media (max-width: 768px) in both files
const CONTENT_MAX_WIDTH = 500; // .quiz__content max-width, Quiz.scss
const MOBILE_HORIZONTAL_PADDING = 24; // .quiz-page__main padding: 0.75rem each side, Quiz.scss
const DESKTOP_TILE = 64, DESKTOP_GAP = 12; // 4rem tile, 0.75rem gap
const MOBILE_TILE = 52, MOBILE_GAP = 8; // 3.25rem tile, 0.5rem gap

function tileCapacityForViewport(viewportWidth) {
  const isMobile = viewportWidth <= MOBILE_BREAKPOINT;
  const contentWidth = isMobile
    ? Math.min(CONTENT_MAX_WIDTH, viewportWidth - MOBILE_HORIZONTAL_PADDING)
    : CONTENT_MAX_WIDTH;
  const tile = isMobile ? MOBILE_TILE : DESKTOP_TILE;
  const gap = isMobile ? MOBILE_GAP : DESKTOP_GAP;
  return Math.max(1, Math.floor((contentWidth + gap) / (tile + gap)));
}

// Natural flex-wrap fills the first row to capacity and dumps the remainder
// on the last (9 tiles -> 6+3), which reads worse than an even split (5+4).
// Once capacity is exceeded, computes the minimum row count needed and
// splits the tiles as evenly as possible across exactly that many rows.
// Returns null when everything fits on one row (natural flex-wrap is
// already correct there, no need to override it).
export function balancedRowCounts(itemCount, capacity) {
  if (itemCount <= capacity) return null;

  const rows = Math.ceil(itemCount / capacity);
  const perRow = Math.ceil(itemCount / rows);
  const counts = [];
  let remaining = itemCount;
  while (remaining > 0) {
    const count = Math.min(perRow, remaining);
    counts.push(count);
    remaining -= count;
  }
  return counts;
}

function useViewportWidth() {
  const [width, setWidth] = useState(() => window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
}

// The tile bank: every character in `tiles`, with already-placed ones
// dimmed and disabled — seeing what you placed reads better than a hole
// in the bank.
export function SpellingTiles({ tiles, usedTileIndices, revealed = false, onSelect }) {
  const viewportWidth = useViewportWidth();
  const capacity = tileCapacityForViewport(viewportWidth);
  const rowCounts = balancedRowCounts(tiles.length, capacity);

  function renderTile(char, tileIndex) {
    const used = usedTileIndices.has(tileIndex);
    return (
      <button
        type="button"
        key={tileIndex}
        className={cx('modern-spelling-tile', used && 'modern-spelling-tile--used')}
        onClick={() => onSelect(tileIndex)}
        disabled={used || revealed}
      >
        {char}
      </button>
    );
  }

  if (!rowCounts) {
    return (
      <div className="modern-spelling-tiles">
        {tiles.map((char, tileIndex) => renderTile(char, tileIndex))}
      </div>
    );
  }

  let cursor = 0;

  return (
    <div className="modern-spelling-tiles modern-spelling-tiles--balanced">
      {rowCounts.map((count, rowIndex) => {
        const rowStart = cursor;
        cursor += count;
        return (
          <div className="modern-spelling-tiles__row" key={rowIndex}>
            {tiles.slice(rowStart, cursor).map((char, i) => renderTile(char, rowStart + i))}
          </div>
        );
      })}
    </div>
  );
}

import './SpellingTiles.scss';

// The tile bank: every character in `tiles`, with already-placed ones
// dimmed and disabled rather than removed — seeing what you placed reads
// better than a hole where a tile used to be.
export function SpellingTiles({ tiles, usedTileIndices, revealed = false, onSelect }) {
  return (
    <div className="modern-spelling-tiles">
      {tiles.map((char, tileIndex) => {
        const used = usedTileIndices.has(tileIndex);
        return (
          <button
            type="button"
            key={tileIndex}
            className={['modern-spelling-tile', used && 'modern-spelling-tile--used'].filter(Boolean).join(' ')}
            onClick={() => onSelect(tileIndex)}
            disabled={used || revealed}
          >
            {char}
          </button>
        );
      })}
    </div>
  );
}

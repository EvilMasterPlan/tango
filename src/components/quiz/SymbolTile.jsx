import './SymbolTile.scss';

export function SymbolTile({ symbol, isUsed, onSelect }) {
  return (
    <button 
      className={`symbol-tile ${isUsed ? 'used' : ''}`}
      onClick={onSelect}
      disabled={isUsed}
    >
      {isUsed ? '' : symbol}
    </button>
  );
}

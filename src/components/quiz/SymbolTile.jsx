import './SymbolTile.scss';

export function SymbolTile({ symbol, isUsed, onSelect, disabled = false }) {
  return (
    <button 
      className={`symbol-tile ${isUsed ? 'used' : ''} ${disabled ? 'disabled' : ''}`}
      onClick={onSelect}
      disabled={isUsed || disabled}
    >
      {isUsed ? '' : symbol}
    </button>
  );
}

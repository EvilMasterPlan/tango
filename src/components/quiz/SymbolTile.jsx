import './SymbolTile.scss';

export function SymbolTile({ symbol, isUsed, onSelect, disabled = false, hasCheckedAnswer = false }) {
  return (
    <button 
      className={`symbol-tile ${isUsed ? 'used' : ''} ${disabled ? 'disabled' : ''} ${hasCheckedAnswer ? 'checked' : ''}`}
      onClick={onSelect}
      disabled={isUsed || disabled}
    >
      {isUsed ? '' : symbol}
    </button>
  );
}

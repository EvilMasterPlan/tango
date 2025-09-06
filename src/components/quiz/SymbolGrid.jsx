import { SymbolTile } from '@/components/quiz/SymbolTile';
import './SymbolGrid.scss';

export function SymbolGrid({ symbols, usedSymbols, onSymbolSelect }) {
  return (
    <div className="symbol-grid">
      {symbols.map((symbol, index) => (
        <SymbolTile
          key={`${symbol}-${index}`}
          symbol={symbol}
          isUsed={usedSymbols.has(index)}
          onSelect={() => onSymbolSelect(symbol, index)}
        />
      ))}
    </div>
  );
}

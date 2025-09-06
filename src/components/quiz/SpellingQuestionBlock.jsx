import { useState, useEffect } from 'react';
import { QuestionBlock } from '@/components/quiz/QuestionBlock';
import { SpellingSlot } from '@/components/quiz/SpellingSlot';
import { SymbolGrid } from '@/components/quiz/SymbolGrid';
import './SpellingQuestionBlock.scss';

export function SpellingQuestionBlock({ question, reading, choices, onCompletionChange, onSpellingChange, disabled = false }) {
  const [slots, setSlots] = useState(Array(reading.length).fill(null));
  const [usedSymbols, setUsedSymbols] = useState(new Set());

  // Track completion and notify parent
  useEffect(() => {
    const isComplete = slots.every(slot => slot !== null);
    onCompletionChange?.(isComplete);
    
    // Send current spelling to parent
    const currentSpelling = slots.join('');
    onSpellingChange?.(currentSpelling);
  }, [slots, onCompletionChange, onSpellingChange]);

  const handleSymbolSelect = (symbol, symbolIndex) => {
    // Check if disabled or symbol is already used
    if (disabled || usedSymbols.has(symbolIndex)) return;

    // Find the last filled slot to place at the end
    const lastFilledIndex = slots.findLastIndex(slot => slot !== null);
    const targetIndex = lastFilledIndex + 1;
    
    if (targetIndex >= slots.length) return; // No space left

    // Move symbol from available to slot
    const newSlots = [...slots];
    newSlots[targetIndex] = symbol;
    setSlots(newSlots);

    // Mark symbol as used
    setUsedSymbols(prev => new Set([...prev, symbolIndex]));
  };

  const handleSlotClick = (slotIndex) => {
    const symbol = slots[slotIndex];
    if (disabled || !symbol) return;

    // Find which symbol index this corresponds to
    const symbolIndex = choices.findIndex(s => s === symbol);
    
    // Mark symbol as available again
    setUsedSymbols(prev => {
      const newSet = new Set(prev);
      newSet.delete(symbolIndex);
      return newSet;
    });

    // Shift remaining tiles to the left to fill the gap
    const newSlots = [...slots];
    newSlots[slotIndex] = null;
    
    // Shift all tiles after the removed one to the left
    for (let i = slotIndex; i < newSlots.length - 1; i++) {
      newSlots[i] = newSlots[i + 1];
    }
    newSlots[newSlots.length - 1] = null; // Clear the last slot
    
    setSlots(newSlots);
  };

  return (
    <div className="spelling-question-block">
      <QuestionBlock question={question} />
      
      <div className="spelling-area">
        <div className="slots-container">
          {slots.map((symbol, index) => (
            <SpellingSlot
              key={index}
              symbol={symbol}
              onClick={() => handleSlotClick(index)}
            />
          ))}
        </div>
        
        <SymbolGrid 
          symbols={choices}
          usedSymbols={usedSymbols}
          onSymbolSelect={handleSymbolSelect}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

import { createContext, useContext } from 'react';
import { useWordProgress } from '@/hooks/useWordProgress';

const WordsProgressContext = createContext(null);

// Lets the header's filter/sort controls (WordsControls) and the results
// grid (WordsGrid) share one useWordProgress instance despite sitting in
// different parts of the page tree — the standalone /words page and the
// combined /overview page's Words mode (see pages/Dashboard) both nest them
// under a sticky header + content split, with the controls living in the
// header and the grid in the content area.
export function WordsProgressProvider({ children }) {
  const value = useWordProgress();
  return <WordsProgressContext.Provider value={value}>{children}</WordsProgressContext.Provider>;
}

export function useWordsProgressContext() {
  const context = useContext(WordsProgressContext);
  if (!context) throw new Error('useWordsProgressContext must be used within a WordsProgressProvider');
  return context;
}

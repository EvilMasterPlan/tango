import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'tango:jp-font';

// Two bundled fonts for rendering Japanese (see @fontsource imports in
// main.jsx). Gothic (sans) is the modern on-screen default; Mincho (serif)
// mirrors the print/textbook style, where some kanji are drawn with
// slightly different stroke shapes — useful to see both while learning.
export const JP_FONTS = {
  gothic: { label: 'Gothic', family: "'Noto Sans JP', sans-serif" },
  mincho: { label: 'Mincho', family: "'Noto Serif JP', serif" },
};

const DEFAULT_JP_FONT = 'gothic';

function readStoredJpFont() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored && JP_FONTS[stored] ? stored : DEFAULT_JP_FONT;
  } catch {
    return DEFAULT_JP_FONT;
  }
}

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [jpFont, setJpFontState] = useState(readStoredJpFont);

  // Drives --font-jp (defined in App.scss) directly on the root element,
  // so every stylesheet referencing var(--font-jp) picks up the change
  // without each component needing to know about the setting itself.
  useEffect(() => {
    document.documentElement.style.setProperty('--font-jp', JP_FONTS[jpFont].family);
  }, [jpFont]);

  const setJpFont = useCallback((font) => {
    if (!JP_FONTS[font]) return;
    setJpFontState(font);
    try {
      window.localStorage.setItem(STORAGE_KEY, font);
    } catch {
      // Private-browsing / storage-disabled — setting just won't survive a reload.
    }
  }, []);

  return (
    <SettingsContext.Provider value={{ jpFont, setJpFont }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}

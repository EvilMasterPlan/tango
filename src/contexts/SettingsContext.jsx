import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { accountApi } from '@/utils/api/account';
import { useUserContext } from '@/contexts/UserContext';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';

const STORAGE_KEY = 'tango:jp-font';

// Coalesces rapid-fire changes (e.g. flipping between fonts a few times)
// into one save rather than one request per tap.
const SAVE_DEBOUNCE_MS = 500;

// The generic TANGO_UserPreferences key this setting is saved under (see
// accountApi.setPreference) — same store as the home page's JLPT focus
// filter (Home/Page.jsx's own 'focusFilters.jlpt' key).
const FONT_PREFERENCE_KEY = 'preferences.font';

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
  const { user, refreshUser } = useUserContext();
  const [jpFont, setJpFontState] = useState(readStoredJpFont);

  // Pre-populates from the user's saved preference once the profile loads,
  // overriding whatever readStoredJpFont's own localStorage guess started
  // with (that guess only exists to avoid a flash of the wrong font before
  // this round-trip resolves). Stays on the local/default value for as
  // long as `user` is null — logged out, or the profile fetch hasn't
  // resolved yet.
  useEffect(() => {
    if (!user) return;
    const stored = user.preferences?.[FONT_PREFERENCE_KEY];
    const font = stored && JP_FONTS[stored] ? stored : DEFAULT_JP_FONT;
    setJpFontState(font);
    try {
      window.localStorage.setItem(STORAGE_KEY, font);
    } catch {
      // Private-browsing / storage-disabled — just won't survive a reload locally.
    }
  }, [user]);

  // Drives --font-jp (defined in App.scss) directly on the root element,
  // so every stylesheet referencing var(--font-jp) picks up the change
  // without each component needing to know about the setting itself.
  useEffect(() => {
    document.documentElement.style.setProperty('--font-jp', JP_FONTS[jpFont].family);
  }, [jpFont]);

  // Only the actual network save is debounced — the local state update
  // above (and below) stays instant, so the font itself still applies the
  // moment it's tapped regardless of how the save is paced.
  const debouncedSaveJpFont = useDebouncedCallback((font) => {
    // Only logged-in users have anything to save it against.
    if (!user) return;
    accountApi
      .setPreference(FONT_PREFERENCE_KEY, font)
      .then(refreshUser)
      .catch((error) => console.warn('Failed to save font preference:', error));
  }, SAVE_DEBOUNCE_MS);

  const setJpFont = useCallback((font) => {
    if (!JP_FONTS[font]) return;
    setJpFontState(font);
    try {
      window.localStorage.setItem(STORAGE_KEY, font);
    } catch {
      // Private-browsing / storage-disabled — setting just won't survive a reload locally.
    }
    debouncedSaveJpFont(font);
  }, [debouncedSaveJpFont]);

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

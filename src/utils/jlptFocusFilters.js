import { ALL_LESSON_TYPES } from '@/utils/lessonTypeMetadata';

// Shared between the home page's own "JLPT Focus Mode" dialog
// (Home/Page.jsx) and the generic Settings dialog's duplicate of the same
// controls (SettingsDialog.jsx) — both read/write the same saved value, so
// the key and its encoding live in one place rather than two.
export const JLPT_FOCUS_LEVELS_PREFERENCE_KEY = 'focusFilters.jlpt';

// Same N5-N1 set as Practice/Page.jsx's JLPT ladder, in the same ascending
// order.
export const JLPT_FOCUS_LEVELS = ALL_LESSON_TYPES.filter((lessonType) => lessonType.startsWith('jlpt_'));

// The stored value is just the selected levels' own digits (from
// "jlpt_n5" → "5") concatenated in ascending order — "" (or unset) means no
// filter, i.e. every level allowed. Sorting before joining keeps the stored
// string canonical regardless of toggle order, though nothing currently
// depends on that beyond making the value predictable to read back.
export function encodeFocusLevels(levels) {
  return [...levels]
    .map((lessonType) => lessonType.replace('jlpt_n', ''))
    .sort()
    .join('');
}

export function decodeFocusLevels(value) {
  if (!value) return new Set();
  return new Set(
    [...value].map((digit) => `jlpt_n${digit}`).filter((lessonType) => JLPT_FOCUS_LEVELS.includes(lessonType)),
  );
}

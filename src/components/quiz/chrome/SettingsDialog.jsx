import { useEffect, useRef, useState } from 'react';
import { IoInformationCircleOutline } from 'react-icons/io5';
import { Modal } from '@/components/shared/Modal';
import { Tile } from '@/components/shared/Tile';
import { JP_FONTS, useSettings } from '@/contexts/SettingsContext';
import { useUserContext } from '@/contexts/UserContext';
import { accountApi } from '@/utils/api/account';
import { LESSON_METADATA_BY_LESSON_TYPE } from '@/utils/lessonTypeMetadata';
import {
  JLPT_FOCUS_LEVELS,
  JLPT_FOCUS_LEVELS_PREFERENCE_KEY,
  decodeFocusLevels,
  encodeFocusLevels,
} from '@/utils/jlptFocusFilters';
import { FREE_JLPT_LEVEL, hasFullAccess } from '@/utils/planAccess';
import { useDebouncedCallback } from '@/hooks/useDebouncedCallback';
import { cx } from '@/utils/cx';
import './SettingsDialog.scss';

// 単語 (tango) — "word/vocabulary", the app's own namesake — doubles as a
// sample that's both on-theme and legible enough to compare fonts by.
const FONT_SAMPLE = { word: '単語', reading: 'たんご' };

// Coalesces rapid-fire toggles (flipping several levels in a row) into one
// save rather than one request per tap.
const SAVE_DEBOUNCE_MS = 500;

// An (i) icon that reveals a small tooltip on hover — plain CSS, via
// .settings-dialog__info:hover — or on click/tap, tracked here since hover
// alone doesn't cover touch. Click-open dismisses on an outside
// click/tap or Escape, same as OverflowMenu's own popup.
function InfoTooltip({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <span className={cx('settings-dialog__info', isOpen && 'settings-dialog__info--open')} ref={wrapperRef}>
      <button
        type="button"
        className="settings-dialog__info-trigger"
        aria-label="More info"
        onClick={() => setIsOpen((open) => !open)}
      >
        <IoInformationCircleOutline />
      </button>
      <span className="settings-dialog__tooltip" role="tooltip">
        {children}
      </span>
    </span>
  );
}

export function SettingsDialog({ onClose }) {
  const { jpFont, setJpFont } = useSettings();
  const { user, refreshUser } = useUserContext();
  const canAccessAllLevels = hasFullAccess(user);
  // Duplicates the home page's own "JLPT Focus Mode" dialog controls (see
  // Home/Page.jsx) against the same saved preference — seeded once from
  // the profile at mount (this dialog is unmounted on close, so a fresh
  // mount is a fresh read), then updated optimistically per click rather
  // than only after the save round-trips back through refreshUser.
  const [activeFocusLevels, setActiveFocusLevels] = useState(() =>
    decodeFocusLevels(user?.preferences?.[JLPT_FOCUS_LEVELS_PREFERENCE_KEY]),
  );

  // Only the network save is debounced (and flushed on unmount, i.e. on
  // close — see useDebouncedCallback) — the tile's own pressed state above
  // still updates instantly on every click.
  const debouncedSaveFocusLevels = useDebouncedCallback((levels) => {
    accountApi
      .setPreference(JLPT_FOCUS_LEVELS_PREFERENCE_KEY, encodeFocusLevels(levels))
      .then(refreshUser)
      .catch((error) => console.warn('Failed to save JLPT focus levels:', error));
  }, SAVE_DEBOUNCE_MS);

  function toggleFocusLevel(lessonType) {
    setActiveFocusLevels((prev) => {
      const next = new Set(prev);
      if (next.has(lessonType)) next.delete(lessonType);
      else next.add(lessonType);

      debouncedSaveFocusLevels(next);

      return next;
    });
  }

  return (
    <Modal title="Quick Settings" onClose={onClose}>
      <div className="settings-dialog__section">
        <div className="settings-dialog__label">Japanese Font</div>
        <div className="settings-dialog__font-options">
          {Object.entries(JP_FONTS).map(([key, font]) => (
            <button
              type="button"
              key={key}
              className={cx('settings-dialog__font-option', key === jpFont && 'settings-dialog__font-option--selected')}
              onClick={() => setJpFont(key)}
              aria-pressed={key === jpFont}
            >
              <span className="settings-dialog__font-sample" style={{ fontFamily: font.family }}>
                {FONT_SAMPLE.word}
              </span>
              <span className="settings-dialog__font-sample-reading" style={{ fontFamily: font.family }}>
                {FONT_SAMPLE.reading}
              </span>
              <span className="settings-dialog__font-name">{font.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="settings-dialog__section">
        <div className="settings-dialog__label settings-dialog__label--with-info">
          Focus Mode
          <InfoTooltip>In your next lesson, only practice words from the selected JLPT levels</InfoTooltip>
        </div>
        <div className="settings-dialog__levels">
          {JLPT_FOCUS_LEVELS.map((lessonType) => {
            // Same free/paid gate as Overview/WordTile.jsx's own locked
            // tiles (see planAccess.js) — only FREE_JLPT_LEVEL (N5) is
            // usable on the free plan, so it reads as the default/only
            // choice (highlighted regardless of the actual saved toggle)
            // while N4-N1 are locked out entirely, same hatch/lock/tooltip
            // treatment as the words page (built into <Tile>'s own
            // `locked` prop).
            const jlptLevel = lessonType.replace('jlpt_n', 'N');
            const isFreeLevel = jlptLevel === FREE_JLPT_LEVEL;
            const isLocked = !isFreeLevel && !canAccessAllLevels;
            const isActive = isLocked ? false : (isFreeLevel && !canAccessAllLevels) || activeFocusLevels.has(lessonType);
            return (
              <Tile
                key={lessonType}
                accent={lessonType}
                icon={LESSON_METADATA_BY_LESSON_TYPE[lessonType].icon}
                dim={!isActive}
                locked={isLocked}
                lockedMessage={`Upgrade to practice beyond ${FREE_JLPT_LEVEL}`}
                aria-pressed={isActive}
                onClick={() => toggleFocusLevel(lessonType)}
              />
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

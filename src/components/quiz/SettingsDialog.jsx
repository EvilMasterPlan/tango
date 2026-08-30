import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { IoClose } from 'react-icons/io5';
import { JP_FONTS, useSettings } from '@/contexts/SettingsContext';
import { cx } from '@/utils/cx';
import './SettingsDialog.scss';

// 単語 (tango) — "word/vocabulary", the app's own namesake — doubles as a
// sample that's both on-theme and legible enough to compare fonts by.
const FONT_SAMPLE = { word: '単語', reading: 'たんご' };

export function SettingsDialog({ onClose }) {
  const { jpFont, setJpFont } = useSettings();
  const closeButtonRef = useRef(null);

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return createPortal(
    <div className="settings-dialog__backdrop" onClick={onClose}>
      <div
        className="settings-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="settings-dialog__header">
          <h2 id="settings-dialog-title" className="settings-dialog__title">Settings</h2>
          <button
            type="button"
            className="settings-dialog__close"
            onClick={onClose}
            aria-label="Close"
            ref={closeButtonRef}
          >
            <IoClose />
          </button>
        </div>

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
      </div>
    </div>,
    document.body
  );
}

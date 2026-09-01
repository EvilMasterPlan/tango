import { Modal } from '@/components/shared/Modal';
import { JP_FONTS, useSettings } from '@/contexts/SettingsContext';
import { cx } from '@/utils/cx';
import './SettingsDialog.scss';

// 単語 (tango) — "word/vocabulary", the app's own namesake — doubles as a
// sample that's both on-theme and legible enough to compare fonts by.
const FONT_SAMPLE = { word: '単語', reading: 'たんご' };

export function SettingsDialog({ onClose }) {
  const { jpFont, setJpFont } = useSettings();

  return (
    <Modal title="Settings" onClose={onClose}>
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
    </Modal>
  );
}

import { useEffect, useRef, useState } from 'react';
import { IoClose } from 'react-icons/io5';
import { IoMdSettings } from 'react-icons/io';
import { QuizProgress } from '@/components/quiz/chrome/QuizProgress';
import { IconButton } from '@/components/shared/IconButton';
import { TILE_ACCENTS } from '@/components/shared/Tile';
import { LESSON_METADATA_BY_LESSON_TYPE } from '@/utils/lessonTypeMetadata';
import { cx } from '@/utils/cx';
import './QuizHeader.scss';

// The same icon/accent-color mapping the home page's own tiles use (see
// Tile.jsx's TILE_ACCENTS and lessonTypeMetadata.js), just badge-sized, so
// it's obvious at a glance which lesson type actually got generated
// regardless of how the lesson was started (a normal recommendation, a
// bonus type from Practice/Page.jsx, or a silent fallback to NEW_WORDS).
// Clicking it (same click/tap-tracked pattern as SettingsDialog's own
// InfoTooltip, since hover alone doesn't cover touch) reveals the lesson
// type's name and description, for anyone curious what the symbol means.
// Renders nothing for a lesson type this app doesn't know about, or before
// lessonType has loaded at all.
function LessonTypeBadge({ lessonType }) {
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

  const metadata = LESSON_METADATA_BY_LESSON_TYPE[lessonType];
  if (!metadata) return null;

  const accent = TILE_ACCENTS[lessonType];
  return (
    <span
      className={cx('quiz-header__lesson-type', isOpen && 'quiz-header__lesson-type--open')}
      style={accent ? { '--lesson-type-accent': accent } : undefined}
      ref={wrapperRef}
    >
      <button
        type="button"
        className="quiz-header__lesson-type-trigger"
        aria-label={`${metadata.title} — ${metadata.description}`}
        onClick={() => setIsOpen((open) => !open)}
      >
        {metadata.icon}
      </button>
      <span className="quiz-header__lesson-type-tooltip" role="tooltip">
        <strong>{metadata.title}</strong>
        <span>{metadata.description}</span>
      </span>
    </span>
  );
}

export function QuizHeader({ results, currentIndex, total, lessonType, onSettingsClick }) {
  return (
    <header className="quiz-header">
      <div className="quiz-header__side">
        <IconButton to="/" label="Close">
          <IoClose />
        </IconButton>
      </div>

      <div className="quiz-header__center">
        <LessonTypeBadge lessonType={lessonType} />
        <QuizProgress results={results} currentIndex={currentIndex} total={total} />
      </div>

      <div className="quiz-header__side">
        <IconButton onClick={onSettingsClick} label="Settings">
          <IoMdSettings />
        </IconButton>
      </div>
    </header>
  );
}

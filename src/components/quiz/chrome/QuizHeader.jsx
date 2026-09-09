import { IoClose } from 'react-icons/io5';
import { IoMdSettings } from 'react-icons/io';
import { QuizProgress } from '@/components/quiz/chrome/QuizProgress';
import { IconButton } from '@/components/shared/IconButton';
import { TILE_ACCENTS } from '@/components/shared/Tile';
import { LESSON_METADATA_BY_LESSON_TYPE } from '@/utils/lessonTypeMetadata';
import './QuizHeader.scss';

// A small debugging aid — the same icon/accent-color mapping the home
// page's own tiles use (see Tile.jsx's TILE_ACCENTS and
// lessonTypeMetadata.js), just badge-sized, so it's obvious at a glance
// which lesson type actually got generated regardless of how the lesson was
// started (a normal recommendation, a bonus type from Practice/Page.jsx, or
// a silent fallback to NEW_WORDS). Renders nothing for a lesson type this
// app doesn't know about, or before lessonType has loaded at all.
function LessonTypeBadge({ lessonType }) {
  const metadata = LESSON_METADATA_BY_LESSON_TYPE[lessonType];
  if (!metadata) return null;

  const accent = TILE_ACCENTS[lessonType];
  return (
    <span
      className="quiz-header__lesson-type"
      style={accent ? { '--lesson-type-accent': accent } : undefined}
      title={metadata.title}
      aria-hidden="true"
    >
      {metadata.icon}
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

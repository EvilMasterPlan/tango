import { IoClose } from 'react-icons/io5';
import { IoMdSettings } from 'react-icons/io';
import { QuizProgress } from '@/components/quiz/chrome/QuizProgress';
import { IconButton } from '@/components/shared/IconButton';
import './QuizHeader.scss';

export function QuizHeader({ results, currentIndex, total, onSettingsClick }) {
  return (
    <header className="quiz-header">
      <div className="quiz-header__side">
        <IconButton to="/" label="Close">
          <IoClose />
        </IconButton>
      </div>

      <div className="quiz-header__center">
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

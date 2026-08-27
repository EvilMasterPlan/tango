import { Link } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import { IoMdSettings } from 'react-icons/io';
import { QuizProgress } from '@/components/quiz/modern/QuizProgress';
import './QuizHeader.scss';

export function QuizHeader({ results, currentIndex, total, onSettingsClick }) {
  return (
    <header className="quiz-header">
      <div className="quiz-header__side">
        <Link to="/" className="quiz-header__icon-button">
          <IoClose className="quiz-header__icon" />
        </Link>
      </div>

      <div className="quiz-header__center">
        <QuizProgress results={results} currentIndex={currentIndex} total={total} />
      </div>

      <div className="quiz-header__side">
        <button type="button" className="quiz-header__icon-button" onClick={onSettingsClick}>
          <IoMdSettings className="quiz-header__icon" />
        </button>
      </div>
    </header>
  );
}

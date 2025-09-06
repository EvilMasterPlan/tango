import { Link } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import { IoMdSettings } from 'react-icons/io';
import { LessonProgressBar } from '@/components/lesson/LessonProgressBar';
import '@/components/lesson/LessonHeader.scss';

export function LessonHeader({ current = 7, total = 20, hasCheckedAnswer = false, onSettingsClick }) {
  return (
    <header className="lesson-header">
      <div className="header-left">
        <Link to="/" className="cancel-button">
          <IoClose className="cancel-icon" />
        </Link>
      </div>
      
      <div className="header-center">
        <LessonProgressBar current={current} total={total} hasCheckedAnswer={hasCheckedAnswer} />
      </div>
      
      <div className="header-right">
        <button className="settings-button" onClick={onSettingsClick}>
          <IoMdSettings className="settings-icon" />
        </button>
      </div>
    </header>
  );
}

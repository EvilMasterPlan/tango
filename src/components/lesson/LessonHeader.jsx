import { Link } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import { IoMdSettings } from 'react-icons/io';
import { ProgressBar } from '@/components/shared/ProgressBar';
import '@/components/lesson/LessonHeader.scss';

export function LessonHeader({ current = 7, total = 20, onSettingsClick }) {
  return (
    <header className="lesson-header">
      <div className="header-left">
        <Link to="/" className="cancel-button">
          <IoClose className="cancel-icon" />
        </Link>
      </div>
      
      <div className="header-center">
        <ProgressBar current={current} total={total} />
      </div>
      
      <div className="header-right">
        <button className="settings-button" onClick={onSettingsClick}>
          <IoMdSettings className="settings-icon" />
        </button>
      </div>
    </header>
  );
}

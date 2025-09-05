import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { IoClose } from 'react-icons/io5';
import { IoMdSettings } from 'react-icons/io';
import { ProgressBar } from '@/components/shared/ProgressBar';
import '@/pages/Lesson/Page.scss';

export function LessonPage() {
  return (
    <>
      <Helmet>
        <title>Lesson - SarabaJa</title>
        <meta name="description" content="Japanese vocabulary lesson" />
      </Helmet>
      
      <div className="lesson-page">
        {/* A - Top Bar */}
        <header className="lesson-header">
          <div className="header-left">
            <Link to="/" className="cancel-button">
              <IoClose className="cancel-icon" />
            </Link>
          </div>
          
          <div className="header-center">
            <ProgressBar current={7} total={20} />
          </div>
          
          <div className="header-right">
            <button className="settings-button">
              <IoMdSettings className="settings-icon" />
            </button>
          </div>
        </header>

        {/* B - Main Content */}
        <main className="lesson-content">
          <div className="question-area">
            <h2>TODO</h2>
          </div>
        </main>

        {/* C - Action Footer */}
        <footer className="lesson-footer">
          <button className="action-button skip-button">
            Skip
          </button>
          <button className="action-button check-button">
            Check
          </button>
        </footer>
      </div>
    </>
  );
}

import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function KanjiFocusPage() {
  return (
    <>
      <Helmet>
        <title>Kanji Focus - SarabaJa</title>
        <meta name="description" content="Learn and practice individual kanji characters" />
      </Helmet>
      
      <div className="kanji-focus-container">
        <header className="kanji-focus-header">
          <h1>Kanji Focus</h1>
          <p>Master individual kanji characters through focused practice</p>
        </header>

        <div className="kanji-focus-content">
          <div className="focus-options">
            <div className="focus-option">
              <h3>Practice Mode</h3>
              <p>Dive into focused kanji practice with individual character study.</p>
              <Link to="/vocab/focus/practice" className="btn btn-primary">
                Start Practice
              </Link>
            </div>
            
            <div className="focus-option">
              <h3>Progress Tracking</h3>
              <p>Monitor your kanji mastery progress and review weak areas.</p>
              <button className="btn btn-secondary" disabled>
                Coming Soon
              </button>
            </div>
            
            <div className="focus-option">
              <h3>Custom Sets</h3>
              <p>Create personalized kanji study sets based on your needs.</p>
              <button className="btn btn-secondary" disabled>
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 
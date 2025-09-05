import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { GoalItem } from '@/components/shared/GoalItem';
import '@/pages/Home/Page.scss';

export function Home() {
  return (
    <>
      <Helmet>
        <title>SarabaJa - Japanese Learning Platform</title>
        <meta name="description" content="Master Japanese kanji, vocabulary, and JLPT preparation with personalized study plans." />
      </Helmet>
      
      <div className="homepage-layout">
        {/* Left Sidebar - Logo & Navigation */}
        <aside className="left-sidebar">
          <div className="logo" onClick={() => window.location.href = '/'}>
            <span className="english">Sarabaja</span>
          </div>
          
          <nav className="sidebar-nav">
            <div className="nav-item active">
              <span className="nav-icon">📚</span>
              <span className="nav-label">Vocab</span>
            </div>
          </nav>
        </aside>

        {/* Main Content - Next Lesson Button */}
        <main className="main-content">
          <Link to="/lesson" className="next-lesson-button">
            Next Lesson
          </Link>
        </main>

        {/* Right Sidebar - Progress, Goals & Stats */}
        <aside className="right-sidebar">

          <div className="sidebar-section">
            <h3 className="goals-title">Today's Goals</h3>
            
            <GoalItem
              label="Review Words"
              current={7}
              target={10}
            />

            <GoalItem
              label="New Words"
              current={3}
              target={5}
            />

            <GoalItem
              label="Practice Time"
              current={15}
              target={30}
              unit="min"
            />
          </div>
        </aside>
      </div>
    </>
  );
}

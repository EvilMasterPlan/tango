import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { TagSection } from '@/components/shared/TagSection';
import '@/pages/Home/Page.scss';

export function HomePage({ tags }) {
  const calculateProficiencyData = (proficiency) => {
    if (!proficiency) return null;
    
    const { rank, total, breakout = {} } = proficiency;
    const { none, novice, adept, expert } = breakout;
    
    // Calculate the count for the current rank
    let count = 0;
    if (rank === 'novice') {
      count = novice + adept + expert;
    } else if (rank === 'adept') {
      count = adept + expert;
    } else if (rank === 'expert') {
      count = expert;
    }
    
    return {
      rank,
      count,
      total,
      percentage: Math.round((count / total) * 100)
    };
  };
  return (
    <>
      <Helmet>
        <title>Tango Tanuki</title>
        <meta name="description" content="Master Japanese kanji, vocabulary, and JLPT preparation with personalized study plans." />
      </Helmet>
      
      <div className="homepage-layout">
        <div className="lesson-buttons">
          <Link to="/lesson" className="tag-section all-words-section">
            <div className="tag-icon-section">
              <div className="home-progress-background">
                <div className="home-progress-fill" style={{ height: '25%' }}></div>
              </div>
              <div className="star-icon">⭐</div>
            </div>
            
            <div className="tag-info">
              <div className="tag-label">All Words</div>
              <div className="tag-progress">25/25</div>
            </div>
          </Link>
          
          {tags && Array.isArray(tags) && tags.map((tag) => {
            const proficiencyData = calculateProficiencyData(tag.proficiency);
            
            return (
              <TagSection
                key={tag.id}
                tag={tag}
                proficiencyData={proficiencyData}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}

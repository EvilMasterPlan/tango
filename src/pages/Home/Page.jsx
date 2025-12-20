import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { TagSection } from '@/components/shared/TagSection';
import '@/pages/Home/Page.scss';

export function HomePage({ tags }) {
  const calculateRankingData = (ranking) => {
    if (!ranking) return null;
    
    const { currentVocab, totalVocab, currentLevel } = ranking;
    
    return {
      currentVocab,
      totalVocab,
      currentLevel,
      percentage: totalVocab > 0 ? Math.round((currentVocab / totalVocab) * 100) : 0
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
              <div className="star-icon">全</div>
            </div>
            
            <div className="tag-info">
              <div className="tag-label">All Words</div>
            </div>
          </Link>
          
          {tags && Array.isArray(tags) && tags.map((tag) => {
            const rankingData = calculateRankingData(tag.ranking);
            
            return (
              <TagSection
                key={tag.id}
                tag={tag}
                rankingData={rankingData}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}

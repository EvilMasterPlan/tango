import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import '@/pages/Home/Page.scss';

export function HomePage({ tags }) {
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
              <div className="progress-background">
                <div className="progress-fill" style={{ height: '25%' }}></div>
              </div>
              <div className="star-icon">⭐</div>
            </div>
            
            <div className="tag-info">
              <div className="tag-label">All Words</div>
              <div className="tag-progress">25/25</div>
            </div>
          </Link>
          
          {tags && Array.isArray(tags) && tags.map((tag) => (
            <Link 
              key={tag.id} 
              to={`/lesson?tagID=${tag.id}`} 
              className="tag-section"
            >
              <div className="tag-icon-section">
                <div className="progress-background">
                  <div className="progress-fill" style={{ height: '25%' }}></div>
                </div>
                <div className="star-icon">⭐</div>
              </div>
              
              <div className="tag-info">
                <div className="tag-label">{tag.label}</div>
                <div className="tag-progress">25/25</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

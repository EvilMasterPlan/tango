import { Link } from 'react-router-dom';
import { ProficiencyMetric } from './ProficiencyMetric';

export function TagSection({ tag, proficiencyData }) {
  const total = tag.proficiency?.total || 0;
  
  const getStarCount = (rank) => {
    switch (rank) {
      case 'novice': return 1;
      case 'adept': return 2;
      case 'expert': return 3;
      default: return 0;
    }
  };
  
  const starCount = proficiencyData ? getStarCount(proficiencyData.rank) : 0;
  const stars = '⭐'.repeat(starCount);

  return (
    <Link 
      key={tag.id} 
      to={`/lesson?tagID=${tag.id}`} 
      className="tag-section"
    >
      <div className="tag-icon-section">
        <div className="home-progress-background">
          <div 
            className="home-progress-fill" 
            style={{ height: proficiencyData ? `${proficiencyData.percentage}%` : '0%' }}
          ></div>
        </div>
        <div className="star-icon">{stars}</div>
      </div>
      
      <div className="tag-info">
        <div className="tag-label">{tag.label}</div>
        <div className="proficiency-metrics">
          <ProficiencyMetric
            label={proficiencyData.rank}
            numerator={proficiencyData.count}
            denominator={proficiencyData.total}
          />
        </div>
      </div>
    </Link>
  );
}

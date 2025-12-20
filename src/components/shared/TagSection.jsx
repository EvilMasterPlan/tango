import { Link } from 'react-router-dom';
import { getTierName } from '@/constants/tierColors';
import { RankBadge } from './RankBadge';

export function TagSection({ tag, rankingData }) {
  const currentLevel = rankingData?.currentLevel ?? 0;
  const currentVocab = rankingData?.currentVocab ?? 0;
  const totalVocab = rankingData?.totalVocab ?? 0;
  
  const tierName = getTierName(currentLevel);
  const tierClass = `tier-${tierName}`;

  return (
    <Link 
      key={tag.id} 
      to={`/lesson?tagID=${tag.id}`} 
      className={`tag-section ${tierClass}`}
    >
      <div className="tag-icon-section">
        <RankBadge level={currentLevel} />
      </div>
      
      <div className="tag-info">
        <div className="tag-label">{tag.label}</div>
        <div className="tag-progress-bar">
          <div 
            className="tag-progress-fill"
            style={{ width: rankingData ? `${rankingData.percentage}%` : '0%' }}
          ></div>
          <div className="tag-progress-text">
            <span className="numerator">{currentVocab}</span>
            <span> / </span>
            <span className="denominator">{totalVocab}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

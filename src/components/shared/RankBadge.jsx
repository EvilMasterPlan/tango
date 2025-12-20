import { useRef, useEffect, useState } from 'react';
import { getTierName } from '@/constants/tierColors';
import './RankBadge.scss';

export function RankBadge({ level }) {
  const tierName = getTierName(level);
  const displayLevel = Math.min(level, 8);
  
  // Split pips into two rows if more than 4
  const getPipRows = () => {
    if (displayLevel <= 4) {
      return [displayLevel];
    }
    // Split evenly: first row gets ceil, second row gets floor
    const firstRow = Math.ceil(displayLevel / 2);
    const secondRow = displayLevel - firstRow;
    return [firstRow, secondRow];
  };
  
  const pipRows = getPipRows();
  
  const tierNameRef = useRef(null);
  const [fontSize, setFontSize] = useState('0.65rem');
  
  useEffect(() => {
    const element = tierNameRef.current;
    if (!element) return;
    
    const maxWidth = 60; // Badge width in pixels
    const padding = 8; // Padding on each side
    const availableWidth = maxWidth - (padding * 2);
    
    // Start with base font size
    let currentSize = 10.4; // 0.65rem = ~10.4px at default 16px base
    element.style.fontSize = `${currentSize}px`;
    
    // Measure and adjust if needed
    const measureText = () => {
      const textWidth = element.scrollWidth;
      if (textWidth > availableWidth && currentSize > 6) {
        currentSize -= 0.5;
        element.style.fontSize = `${currentSize}px`;
        // Re-measure recursively until it fits or hits minimum
        requestAnimationFrame(measureText);
      } else {
        setFontSize(`${currentSize}px`);
      }
    };
    
    // Small delay to ensure DOM is ready
    requestAnimationFrame(measureText);
  }, [tierName]);

  return (
    <div className="tier-badge">
      <div ref={tierNameRef} className="tier-name" style={{ fontSize }}>
        {tierName}
      </div>
      {displayLevel > 0 && (
        <div className="tier-pips-container">
          {pipRows.map((count, index) => (
            <div key={index} className="tier-pips-row">
              {'★'.repeat(count)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


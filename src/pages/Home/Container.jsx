import { api } from '@/utils/api/tango';
import { useApiCall } from '@/utils/api/common';
import { HomePage } from './Page';

export function HomeContainer() {
  const { isLoading, error, data: overallProgress } = useApiCall(api.getOverallProgress);
  
  // Console log the overallProgress when it's loaded
  if (overallProgress) {
    console.log('OverallProgress loaded:', overallProgress);
    console.log('OverallProgress structure:', typeof overallProgress, Array.isArray(overallProgress));
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">Failed to load page data</div>
      </div>
    );
  }

  // Desired tag labels to show
  const desiredLabels = [
    'N4',
    'N5',
    'adjective',
    'adverb',
    'day of month',
    'relative day',
    'kanji',
    'kanji (full)',
    'katakana',
    'noun',
    'verb',
    'numeric'
  ];

  // Convert overallProgress object to array format and filter by desired labels
  const tagsArray = overallProgress?.tags ? Object.entries(overallProgress.tags)
    .map(([id, tagData]) => ({
      id,
      ...tagData
    }))
    .filter(tag => desiredLabels.includes(tag.label)) : [];
  
  return <HomePage tags={tagsArray} />;
}

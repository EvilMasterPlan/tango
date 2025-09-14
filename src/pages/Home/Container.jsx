import { api } from '@/utils/api/tango';
import { useApiCall } from '@/utils/api/common';
import { HomePage } from './Page';

export function HomeContainer() {
  const { isLoading, error, data: tags } = useApiCall(api.getAllTags);
  
  // Console log the tags when they're loaded
  if (tags) {
    console.log('Tags loaded:', tags);
    console.log('Tags structure:', typeof tags, Array.isArray(tags));
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
    'counter',
    'day of month',
    'day of week',
    'relative day',
    'kanji',
    'kanji (full)',
    'katakana',
    'noun',
    'verb',
    'numeric'
  ];

  // Convert tags object to array format and filter by desired labels
  const tagsArray = tags?.tags ? Object.entries(tags.tags)
    .map(([id, tagData]) => ({
      id,
      ...tagData
    }))
    .filter(tag => desiredLabels.includes(tag.label)) : [];
  
  return <HomePage tags={tagsArray} />;
}

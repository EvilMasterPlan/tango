import '@/components/shared/ProgressBar.scss';

export function ProgressBar({ current = 0, total = 1 }) {
  const progress = Math.min(Math.max((current / total) * 100, 0), 100);
  
  return (
    <div className="progress-bar">
      <div 
        className="progress-fill" 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
}

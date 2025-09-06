import '@/components/shared/ProgressBar.scss';

export function ProgressBar({ percentage = 0 }) {
  const progress = Math.min(Math.max(percentage, 0), 100);
  
  return (
    <div className="progress-bar">
      <div 
        className="progress-fill" 
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
}

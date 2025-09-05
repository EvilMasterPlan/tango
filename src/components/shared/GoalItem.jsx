import '@/components/shared/GoalItem.scss';

export function GoalItem({
  label,
  current,
  target,
  unit = '',
  className = '',
  displayAsPercentage = false
}) {
  const progress = Math.min((current / target) * 100, 100);
  const displayValue = displayAsPercentage 
    ? `${current}%` 
    : unit ? `${current}/${target} ${unit}` : `${current}/${target}`;

  return (
    <div className={`goal-item ${className}`}>
      <div className="goal-header">
        <span className="goal-label">{label}</span>
        <span className="goal-progress">{displayValue}</span>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
}

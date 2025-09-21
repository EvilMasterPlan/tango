export function ProficiencyMetric({ label, numerator, denominator }) {
  return (
    <div className="metric">
      <span className="metric-label">{label}</span>
      <span className="metric-value">
        <span className="numerator">{numerator}</span>
        <span> / </span>
        <span className="denominator">{denominator}</span>
      </span>
    </div>
  );
}

export function StatCard({ number, label }) {
  return (
    <div className="stat-card card">
      <div className="stat-number">{number}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
} 
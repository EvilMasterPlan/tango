interface StatCardProps {
  number: number;
  label: string;
}

export function StatCard({ number, label }: StatCardProps) {
  return (
    <div className="stat-card card">
      <div className="stat-number">{number}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
} 
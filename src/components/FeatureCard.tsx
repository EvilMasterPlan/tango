import { useNavigate } from 'react-router-dom';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  route: string;
}

export function FeatureCard({ icon, title, description, route }: FeatureCardProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(route);
  };

  return (
    <div className="feature-card card" onClick={handleClick} style={{ cursor: 'pointer' }}>
      <div className="feature-icon">{icon}</div>
      <h4>{title}</h4>
      <p>{description}</p>
    </div>
  );
} 
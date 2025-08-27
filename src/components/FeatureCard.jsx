import { useNavigate } from 'react-router-dom';

export function FeatureCard({ icon, title, description, route }) {
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

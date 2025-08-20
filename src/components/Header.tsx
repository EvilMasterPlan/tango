import { useNavigate } from 'react-router-dom';

export function Header() {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo" onClick={handleLogoClick}>
            <span className="japanese">日本語</span>
            <span className="english">Sarabaja</span>
          </div>
        </div>
      </div>
    </header>
  );
} 
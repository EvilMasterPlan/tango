import { Link } from 'react-router-dom';
import '@/pages/account/Account.scss';

function AccountLayout({ title, subtitle, children, footerText, footerHref, footerCta }) {
  return (
    <section className="account-shell">
      <div className="account-card">
        <h1 className="account-title">{title}</h1>
        {subtitle ? <p className="account-subtitle">{subtitle}</p> : null}
        {children}
        {(footerText && footerHref) || footerCta ? (
          <div className="account-actions">
            {footerText && footerHref ? (
              <Link to={footerHref} className="account-link">
                {footerText}
              </Link>
            ) : (
              <span />
            )}
            {footerCta || null}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default AccountLayout;

import { NavLink } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';

export function Navigation() {
  const { t } = useSettings();

  const links = [
    { to: '/dashboard', label: t.nav.dashboard },
    { to: '/checkin', label: t.nav.checkin },
    { to: '/goals', label: t.nav.goals },
    { to: '/reports', label: t.nav.reports },
    { to: '/data', label: t.nav.data },
    { to: '/settings', label: t.nav.settings },
  ];

  return (
    <nav className="navigation">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}

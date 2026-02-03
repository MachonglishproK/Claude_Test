import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';

export function Navigation() {
  const { t } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: '/dashboard', label: t.nav.dashboard },
    { to: '/checkin', label: t.nav.checkin },
    { to: '/goals', label: t.nav.goals },
    { to: '/reports', label: t.nav.reports },
    { to: '/data', label: t.nav.data },
    { to: '/settings', label: t.nav.settings },
  ];

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Close menu when clicking outside or pressing Escape
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  return (
    <>
      <button
        className="nav-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
      >
        <span className={`nav-toggle-icon ${isOpen ? 'open' : ''}`}></span>
      </button>
      <nav className={`navigation ${isOpen ? '' : 'collapsed'}`}>
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
    </>
  );
}

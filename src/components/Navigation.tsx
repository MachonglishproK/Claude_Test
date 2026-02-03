import { useState, useEffect, type ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, PenSquare, Target, BarChart3, Database, Settings } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

export function Navigation() {
  const { t } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links: NavItem[] = [
    { to: '/dashboard', label: t.nav.dashboard, icon: <Home size={18} /> },
    { to: '/checkin', label: t.nav.checkin, icon: <PenSquare size={18} /> },
    { to: '/goals', label: t.nav.goals, icon: <Target size={18} /> },
    { to: '/reports', label: t.nav.reports, icon: <BarChart3 size={18} /> },
    { to: '/data', label: t.nav.data, icon: <Database size={18} /> },
    { to: '/settings', label: t.nav.settings, icon: <Settings size={18} /> },
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
            <span className="nav-icon">{link.icon}</span>
            <span className="nav-label">{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}

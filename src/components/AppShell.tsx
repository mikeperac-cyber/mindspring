import type { ReactNode } from 'react';
import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { StorageNotice } from './StorageNotice';
import { ThemeCycleButton } from './ThemeControls';
import { NavIcon, type NavIconName } from './NavIcon';

const desktopLinks = [
  { to: '/app/home', label: 'Home', end: true },
  { to: '/app/goals', label: 'Goals' },
  { to: '/app/habits', label: 'Habits' },
  { to: '/app/journal', label: 'Journal' },
  { to: '/app/insights', label: 'Insights' },
  { to: '/app/profile', label: 'Profile' },
];

const mobileLinks = [
  { to: '/app/home', label: 'Home', icon: 'home', end: true },
  { to: '/app/goals', label: 'Goals', icon: 'goals' },
  { to: '/app/journal', label: 'Journal', icon: 'journal' },
  { to: '/app/profile', label: 'Profile', icon: 'profile' },
];

export function AppShell({ children }: { children?: ReactNode }) {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div className="app-frame">
      <header className="topbar">
        <Link className="brand" to="/app/home" aria-label="Mindspring home">
          <span className="brand-mark" aria-hidden="true">m</span>
          <span className="brand-word">mindspring</span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {desktopLinks.map(({ to, label, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              {label}
            </NavLink>
          ))}
        </nav>

        <ThemeCycleButton />
      </header>

      <StorageNotice />

      <main id="main-content" className="app-content">
        {children ?? <Outlet />}
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {mobileLinks.slice(0, 2).map(({ to, label, icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => isActive ? 'mobile-nav-link active' : 'mobile-nav-link'}>
            <span className="mobile-nav-icon"><NavIcon name={icon as NavIconName} /></span>
            <span>{label}</span>
          </NavLink>
        ))}
        <div className="mobile-add-wrap">
          <button
            className="mobile-add-button"
            type="button"
            aria-label="Add"
            aria-expanded={addOpen}
            aria-controls="quick-add-menu"
            onClick={() => setAddOpen((open) => !open)}
          >
            <span aria-hidden="true">+</span>
            <span>Add</span>
          </button>
          {addOpen && (
            <div className="quick-add-menu" id="quick-add-menu" aria-label="Quick add">
              <Link to="/app/goals" onClick={() => setAddOpen(false)}>Add a goal</Link>
              <Link to="/app/habits" onClick={() => setAddOpen(false)}>Add a habit</Link>
              <Link to="/app/journal" onClick={() => setAddOpen(false)}>Write an entry</Link>
            </div>
          )}
        </div>
        {mobileLinks.slice(2).map(({ to, label, icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => isActive ? 'mobile-nav-link active' : 'mobile-nav-link'}>
            <span className="mobile-nav-icon"><NavIcon name={icon as NavIconName} /></span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

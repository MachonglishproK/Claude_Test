import { Outlet } from 'react-router-dom';
import { Navigation } from './Navigation';

export function Layout() {
  return (
    <div className="app-layout">
      <header className="app-header">
        <h1 className="app-title">Weekly Review</h1>
        <Navigation />
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const adminNav = [
  { to: '/dashboard', icon: '🏠', label: 'Overview' },
  { to: '/jobs', icon: '💼', label: 'All Jobs' },
  { to: '/users', icon: '👥', label: 'Team' },
  { to: '/profile', icon: '👤', label: 'My Profile' },
];

const techNav = [
  { to: '/dashboard', icon: '🏠', label: 'My Dashboard' },
  { to: '/jobs', icon: '📋', label: 'My Jobs' },
  { to: '/profile', icon: '👤', label: 'My Profile' },
];

const clientNav = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/jobs', icon: '📋', label: 'My Jobs' },
  { to: '/profile', icon: '👤', label: 'My Profile' },
];

const navMap = { ADMIN: adminNav, TECHNICIAN: techNav, CLIENT: clientNav };

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = navMap[user?.role] || [];
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className="page-wrapper">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">FO</div>
          <div className="sidebar-logo-text">
            <strong>FieldOps</strong>
            <span>Field Service</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-section">
            <div className="sidebar-nav-label">Navigation</div>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard'}
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user" onClick={handleLogout} title="Click to logout">
            <div className="user-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role} · Logout</div>
            </div>
          </div>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'hidden' }}>
        <header className="topbar">
          <div className="topbar-title">
            <span
              className={`role-pill role-pill-${user?.role?.toLowerCase()}`}
            >
              {user?.role}
            </span>
          </div>
          <div className="topbar-actions">
            <NotificationBell />
            <div className="user-avatar" style={{ width: 36, height: 36, fontSize: '0.85rem' }}>{initials}</div>
          </div>
        </header>

        <main className="main-content">
          {/* Injected by router outlet in App.jsx */}
          <LayoutOutlet />
        </main>
      </div>
    </div>
  );
}

// We need Outlet from react-router-dom in the main content
import { Outlet as LayoutOutlet } from 'react-router-dom';

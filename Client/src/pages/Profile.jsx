import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  if (!user) return null;

  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const joinedDate = new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric', 
    day: 'numeric' 
  });

  return (
    <div className="container" style={{ maxWidth: 800 }}>
      <div className="page-header">
        <div className="page-title">
          <h1>My Profile</h1>
          <p>Manage your account settings and preferences</p>
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', alignItems: 'start' }}>
        {/* Left Column: Avatar & Basic Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ textAlign: 'center', paddingTop: '3rem' }}>
            <div className="user-avatar" style={{ width: 100, height: 100, fontSize: '2.5rem', margin: '0 auto 1.5rem auto', border: '4px solid var(--bg-elevated)' }}>
              {initials}
            </div>
            <h2 style={{ marginBottom: '0.25rem' }}>{user.name}</h2>
            <div className={`role-pill role-pill-${user.role.toLowerCase()}`} style={{ display: 'inline-block', marginBottom: '1rem' }}>
              {user.role}
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1rem' }}>
              Member since {joinedDate}
            </div>
          </div>

          <div className="card" style={{ background: 'rgba(99, 102, 241, 0.05)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary-light)' }}>
              <span style={{ fontSize: '1.25rem' }}>🛡️</span>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Security Status</div>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Your account is secured with 256-bit JWT encryption.
            </div>
          </div>
        </div>

        {/* Right Column: Details & Settings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ marginBottom: '1.5rem' }}>Personal Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <div className="form-input" style={{ background: 'var(--bg-surface)', cursor: 'default' }}>{user.name}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="form-input" style={{ background: 'var(--bg-surface)', cursor: 'default' }}>{user.email}</div>
              </div>
              <div className="form-group">
                <label className="form-label">Account Role</label>
                <div className="form-input" style={{ background: 'var(--bg-surface)', cursor: 'default', textTransform: 'capitalize' }}>{user.role.toLowerCase()}</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 style={{ marginBottom: '1.5rem' }}>Account Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} disabled>
                🔒 Change Password (Coming Soon)
              </button>
              <button className="btn btn-secondary" style={{ justifyContent: 'flex-start' }} disabled>
                📧 Notification Preferences
              </button>
              <button className="btn btn-danger" style={{ justifyContent: 'flex-start', marginTop: '1rem' }} disabled>
                🗑️ Deactivate My Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

// ====== ADMIN DASHBOARD ======
function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/jobs/stats')
      .then(({ data }) => setStats(data))
      .catch(() => toast.error('Failed to load stats'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner spinner-lg" /></div>;

  const statCards = [
    { label: 'Total Jobs', value: stats?.total ?? 0, icon: '💼', color: '#6366f1', bg: 'rgba(99,102,241,0.15)' },
    { label: 'Pending', value: stats?.pending ?? 0, icon: '⏳', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    { label: 'In Progress', value: stats?.inProgress ?? 0, icon: '⚡', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
    { label: 'Completed', value: stats?.completed ?? 0, icon: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  ];

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Operations Overview</h1>
          <p>Real-time snapshot of field service activity</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/jobs/new')}>
          + Create Job
        </button>
      </div>

      <div className="grid-4" style={{ marginBottom: '2rem' }}>
        {statCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="stat-card-glow" style={{ background: card.color }} />
            <div className="stat-card-icon" style={{ background: card.bg, color: card.color }}>
              {card.icon}
            </div>
            <div className="stat-card-value" style={{ color: card.color }}>{card.value}</div>
            <div className="stat-card-label">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3>Recent Jobs</h3>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate('/jobs')}>View All</button>
            </div>
            {stats?.recentJobs?.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <p>No jobs yet. Create your first job.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {stats?.recentJobs?.map(job => (
                  <div key={job._id}
                    className="job-card"
                    onClick={() => navigate(`/jobs/${job._id}`)}
                    style={{ padding: '1rem' }}
                  >
                    <div className="job-card-header">
                      <span className="job-card-title">{job.title}</span>
                      <StatusBadge status={job.status} />
                    </div>
                    <div className="job-card-meta">
                      <span>👤 {job.client?.name}</span>
                      {job.technician && <span>🔧 {job.technician?.name}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: '1rem' }}>Job Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {[
              { label: 'Pending', value: stats?.pending, total: stats?.total, color: '#f59e0b' },
              { label: 'Assigned', value: stats?.assigned, total: stats?.total, color: '#6366f1' },
              { label: 'In Progress', value: stats?.inProgress, total: stats?.total, color: '#3b82f6' },
              { label: 'Completed', value: stats?.completed, total: stats?.total, color: '#10b981' },
              { label: 'Cancelled', value: stats?.cancelled, total: stats?.total, color: '#ef4444' },
            ].map(item => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontWeight: 600 }}>{item.value ?? 0}</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%',
                    width: `${item.total > 0 ? ((item.value ?? 0) / item.total) * 100 : 0}%`,
                    background: item.color,
                    borderRadius: 3,
                    transition: 'width 1s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ====== TECHNICIAN DASHBOARD ======
function TechnicianDashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/jobs?status=IN_PROGRESS&status=ASSIGNED')
      .then(({ data }) => setJobs(data.jobs))
      .catch(() => toast.error('Failed to load jobs'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner spinner-lg" /></div>;

  const active = jobs.filter(j => j.status === 'IN_PROGRESS');
  const assigned = jobs.filter(j => j.status === 'ASSIGNED');

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>My Dashboard</h1>
          <p>Your field assignments and active work</p>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>📋</div>
          <div className="stat-card-value" style={{ color: '#6366f1' }}>{assigned.length}</div>
          <div className="stat-card-label">Awaiting Start</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>⚡</div>
          <div className="stat-card-value" style={{ color: '#3b82f6' }}>{active.length}</div>
          <div className="stat-card-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>✅</div>
          <div className="stat-card-value" style={{ color: '#10b981' }}>{jobs.length}</div>
          <div className="stat-card-label">Total Assigned</div>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-icon">🎉</div>
            <h3>All clear!</h3>
            <p>No active jobs right now. Check back later.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3>Active Assignments</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/jobs')}>View All</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {jobs.map(job => (
              <div key={job._id} className="job-card" onClick={() => navigate(`/jobs/${job._id}`)}>
                <div className="job-card-header">
                  <span className="job-card-title">{job.title}</span>
                  <StatusBadge status={job.status} />
                </div>
                <div className="job-card-meta">
                  <span>👤 {job.client?.name}</span>
                  {job.scheduledAt && <span>📅 {new Date(job.scheduledAt).toLocaleDateString()}</span>}
                  {job.location && <span>📍 {job.location}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ====== CLIENT DASHBOARD ======
function ClientDashboard() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/jobs')
      .then(({ data }) => setJobs(data.jobs))
      .catch(() => toast.error('Failed to load jobs'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner spinner-lg" /></div>;

  const active = jobs.filter(j => ['ASSIGNED', 'IN_PROGRESS', 'PENDING'].includes(j.status));

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>Welcome, {user?.name?.split(' ')[0]}</h1>
          <p>Track your service requests in real-time</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/jobs/new')}>
          + New Request
        </button>
      </div>

      <div className="grid-3" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(99,102,241,0.15)', color: '#6366f1' }}>💼</div>
          <div className="stat-card-value" style={{ color: '#6366f1' }}>{jobs.length}</div>
          <div className="stat-card-label">Total Jobs</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6' }}>⚡</div>
          <div className="stat-card-value" style={{ color: '#3b82f6' }}>{active.length}</div>
          <div className="stat-card-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>✅</div>
          <div className="stat-card-value" style={{ color: '#10b981' }}>{jobs.filter(j => j.status === 'COMPLETED').length}</div>
          <div className="stat-card-label">Completed</div>
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h3>Your Service Requests</h3>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/jobs')}>View All</button>
        </div>
        {jobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h3>No jobs yet</h3>
            <p>Contact your service provider to create a new job.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {jobs.slice(0, 5).map(job => (
              <div key={job._id} className="job-card" onClick={() => navigate(`/jobs/${job._id}`)}>
                <div className="job-card-header">
                  <span className="job-card-title">{job.title}</span>
                  <StatusBadge status={job.status} />
                </div>
                <div className="job-card-meta">
                  {job.technician ? <span>🔧 {job.technician.name}</span> : <span style={{ color: 'var(--status-pending)' }}>🕐 Awaiting assignment</span>}
                  <span>📅 {new Date(job.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ====== STATUS BADGE HELPER ======
function StatusBadge({ status }) {
  const cls = `badge badge-${status?.toLowerCase().replace('_', '_')}`;
  const labels = {
    PENDING: 'Pending',
    ASSIGNED: 'Assigned',
    IN_PROGRESS: 'In Progress',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };
  return <span className={cls}>{labels[status] || status}</span>;
}

// ====== MAIN DASHBOARD PAGE ======
export default function Dashboard() {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') return <AdminDashboard />;
  if (user?.role === 'TECHNICIAN') return <TechnicianDashboard />;
  return <ClientDashboard />;
}

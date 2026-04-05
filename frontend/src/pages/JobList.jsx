import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function JobList() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/jobs')
      .then(({ data }) => setJobs(data.jobs))
      .catch(() => toast.error('Failed to load jobs'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner spinner-lg" /></div>;

  const filteredJobs = jobs.filter(job => {
    if (filter !== 'ALL' && job.status !== filter) return false;
    if (search && !job.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getPriorityColor = (p) => {
    switch (p) {
      case 'URGENT': return 'var(--priority-urgent)';
      case 'HIGH': return 'var(--priority-high)';
      case 'MEDIUM': return 'var(--priority-medium)';
      case 'LOW': return 'var(--priority-low)';
      default: return 'inherit';
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <h1>{user?.role === 'CLIENT' ? 'My Security Requests' : 'Jobs'}</h1>
          <p>View and manage service tickets</p>
        </div>
        {user?.role === 'ADMIN' && (
          <button className="btn btn-primary" onClick={() => navigate('/jobs/new')}>
            + New Job
          </button>
        )}
      </div>

      <div className="card">
        <div className="filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['ALL', 'PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map(f => (
              <button
                key={f}
                className={`filter-chip ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
          <div className="search-input-wrapper">
             <span className="search-icon">🔍</span>
             <input
               className="form-input"
               placeholder="Search jobs..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
             />
          </div>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Job Title</th>
                <th>Status</th>
                <th>Priority</th>
                {user?.role !== 'CLIENT' && <th>Client</th>}
                {user?.role !== 'TECHNICIAN' && <th>Technician</th>}
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No jobs found.
                  </td>
                </tr>
              ) : (
                filteredJobs.map(job => (
                  <tr key={job._id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/jobs/${job._id}`)}>
                    <td style={{ fontWeight: 500 }}>{job.title}</td>
                    <td><StatusBadge status={job.status} /></td>
                    <td>
                      <span style={{ color: getPriorityColor(job.priority), fontSize: '0.75rem', fontWeight: 700 }}>
                        {job.priority}
                      </span>
                    </td>
                    {user?.role !== 'CLIENT' && <td>{job.client?.name || '-'}</td>}
                    {user?.role !== 'TECHNICIAN' && <td>{job.technician?.name || <span style={{ color: 'var(--text-muted)' }}>Unassigned</span>}</td>}
                    <td>{new Date(job.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

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

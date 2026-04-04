import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTech, setSelectedTech] = useState('');

  const fetchJob = () => {
    api.get(`/jobs/${id}`)
      .then(res => setData(res.data))
      .catch(() => {
        toast.error('Job not found or access denied');
        navigate('/jobs');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchJob();
    if (user.role === 'ADMIN') {
      api.get('/users?role=TECHNICIAN').then(res => setTechnicians(res.data.users)).catch(console.error);
    }
  }, [id, user.role]);

  const handleStatusChange = async (newStatus) => {
    setStatusUpdating(true);
    try {
      await api.patch(`/jobs/${id}/status`, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchJob();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedTech) return toast.error('Select a technician first');
    setStatusUpdating(true);
    try {
      await api.patch(`/jobs/${id}/assign`, { technicianId: selectedTech });
      toast.success('Job assigned successfully');
      setSelectedTech('');
      fetchJob();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign job');
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      await api.post(`/jobs/${id}/notes`, { note: newNote });
      setNewNote('');
      toast.success('Note added');
      fetchJob();
    } catch (err) {
      toast.error('Failed to add note');
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner spinner-lg" /></div>;
  if (!data?.job) return null;

  const { job, activityLog } = data;
  const canUpdate = user.role === 'ADMIN' || (user.role === 'TECHNICIAN' && job.technician?._id === user._id);

  return (
    <div className="container" style={{ maxWidth: 1000 }}>
      <div className="page-header" style={{ marginBottom: '1rem' }}>
        <div className="page-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ fontSize: '1.5rem' }}>{job.title}</h1>
            <StatusBadge status={job.status} />
          </div>
          <p>ID: {job._id}</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>← Back</button>
      </div>

      <div className="grid-3" style={{ alignItems: 'start' }}>
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card">
            <h3>Job Details</h3>
            <div className="divider" style={{ margin: '1rem 0' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <div className="form-label">Description</div>
                <p style={{ marginTop: '0.25rem', color: 'var(--text-secondary)' }}>{job.description}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <div className="form-label">Client</div>
                  <div style={{ fontWeight: 500 }}>{job.client?.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{job.client?.email}</div>
                </div>
                <div>
                  <div className="form-label">Location</div>
                  <div>{job.location || 'Not specified'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>Activity Timeline</h3>
            <div className="divider" style={{ margin: '1rem 0' }} />
            
            <div className="timeline">
              {activityLog.map(log => (
                <div key={log._id} className="timeline-item">
                  <div className="timeline-dot" style={{ background: log.type === 'STATUS_CHANGE' ? 'var(--primary)' : 'var(--bg-elevated)', border: log.type === 'STATUS_CHANGE' ? 'none' : '1px solid var(--border)' }}>
                    {log.type === 'CREATION' && '🆕'}
                    {log.type === 'STATUS_CHANGE' && '🔄'}
                    {log.type === 'NOTE' && '📝'}
                    {log.type === 'ASSIGNMENT' && '👤'}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-meta">
                      <span className="timeline-actor">{log.actor?.name} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({log.actor?.role.toLowerCase()})</span></span>
                      <span className="timeline-time">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="timeline-message">
                      {log.type === 'STATUS_CHANGE' ? (
                        <>Changed status: <StatusBadge status={log.previousStatus} /> → <StatusBadge status={log.newStatus} /> </>
                      ) : log.message}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {canUpdate && (
              <form onSubmit={handleAddNote} style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
                <input 
                  className="form-input" 
                  placeholder="Add a progress note..." 
                  value={newNote} 
                  onChange={e => setNewNote(e.target.value)} 
                />
                <button type="submit" className="btn btn-primary" disabled={!newNote.trim()}>Post</button>
              </form>
            )}
          </div>

        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card">
            <h3>Status & Assignment</h3>
            <div className="divider" style={{ margin: '1rem 0' }} />
            
            <div style={{ marginBottom: '1.5rem' }}>
              <div className="form-label" style={{ marginBottom: '0.5rem' }}>Current Technician</div>
              {job.technician ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="user-avatar" style={{ width: 32, height: 32 }}>{job.technician.name[0]}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{job.technician.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{job.technician.email}</div>
                  </div>
                </div>
              ) : (
                <div className="alert alert-warning" style={{ padding: '0.5rem' }}>Unassigned</div>
              )}
            </div>

            {canUpdate && (
              <div>
                <div className="form-label" style={{ marginBottom: '0.75rem' }}>Update Status</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {user.role === 'ADMIN' && job.status !== 'COMPLETED' && job.status !== 'CANCELLED' && (
                    <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }}>
                      <label className="form-label">Assign / Reassign</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select 
                          className="form-select" 
                          value={selectedTech} 
                          onChange={(e) => setSelectedTech(e.target.value)}
                        >
                          <option value="">-- Select Tech --</option>
                          {technicians.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                        </select>
                        <button 
                          className="btn btn-primary" 
                          onClick={handleAssign} 
                          disabled={!selectedTech || statusUpdating}
                        >
                          Assign
                        </button>
                      </div>
                    </div>
                  )}
                  {job.status === 'ASSIGNED' && (
                    <button className="btn btn-primary btn-full" onClick={() => handleStatusChange('IN_PROGRESS')} disabled={statusUpdating}>Start Job (In Progress)</button>
                  )}
                  {job.status === 'IN_PROGRESS' && (
                    <button className="btn btn-success btn-full" onClick={() => handleStatusChange('COMPLETED')} disabled={statusUpdating}>Mark Completed</button>
                  )}
                  {user.role === 'ADMIN' && job.status !== 'COMPLETED' && job.status !== 'CANCELLED' && (
                    <button className="btn btn-danger btn-full" onClick={() => handleStatusChange('CANCELLED')} disabled={statusUpdating}>Cancel Job</button>
                  )}
                </div>
              </div>
            )}
            
            {!canUpdate && user.role !== 'CLIENT' && (
              <div className="alert alert-info">You do not have permission to modify this job.</div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cls = `badge badge-${status?.toLowerCase().replace('_', '_')}`;
  return <span className={cls}>{status?.replace('_', ' ')}</span>;
}

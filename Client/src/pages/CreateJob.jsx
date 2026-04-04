import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function CreateJob() {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    clientId: '',
    technicianId: '',
    priority: 'MEDIUM',
    location: '',
  });

  useEffect(() => {
    // Fetch clients and technicians for the dropdowns
    Promise.all([
      api.get('/users?role=CLIENT'),
      api.get('/users?role=TECHNICIAN')
    ]).then(([clientsRes, techRes]) => {
      setClients(clientsRes.data.users);
      setTechnicians(techRes.data.users);
    }).catch(() => toast.error('Failed to load user data'));
  }, []);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.clientId) return toast.error('Please select a client');

    setLoading(true);
    try {
      const { data } = await api.post('/jobs', form);
      toast.success('Job created successfully');
      navigate(`/jobs/${data.job._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 800 }}>
      <div className="page-header">
        <div className="page-title">
          <h1>Create New Job</h1>
          <p>Assign a new service task</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/jobs')}>Cancel</button>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="form-group">
            <label className="form-label">Job Title *</label>
            <input 
              className="form-input" 
              name="title" 
              value={form.title} 
              onChange={handleChange} 
              placeholder="e.g. Server Maintenance" 
              required 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea 
              className="form-textarea" 
              name="description" 
              value={form.description} 
              onChange={handleChange} 
              placeholder="Provide job details..." 
              required 
            />
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Client *</label>
              <select className="form-select" name="clientId" value={form.clientId} onChange={handleChange} required>
                <option value="" disabled>Select Client</option>
                {clients.map(c => <option key={c._id} value={c._id}>{c.name} ({c.email})</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Assign Technician</label>
              <select className="form-select" name="technicianId" value={form.technicianId} onChange={handleChange}>
                <option value="">-- Unassigned --</option>
                {technicians.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select className="form-select" name="priority" value={form.priority} onChange={handleChange}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Location</label>
              <input 
                className="form-input" 
                name="location" 
                value={form.location} 
                onChange={handleChange} 
                placeholder="e.g. 123 Main St" 
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

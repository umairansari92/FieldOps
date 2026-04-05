import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'CLIENT', fields: [] });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const availableFields = ['HVAC', 'Electrical', 'Plumbing', 'General Maintenance', 'IT/Networking'];

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFieldToggle = (field) => {
    const updatedFields = form.fields.includes(field)
      ? form.fields.filter(f => f !== field)
      : [...form.fields, field];
    setForm({ ...form, fields: updatedFields });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const user = await register(form.name, form.email, form.password, form.role, form.fields);
      if (user.isActive === false) {
        toast.success('Registration successful. Your account is pending admin approval.', { duration: 5000 });
        navigate('/login');
      } else {
        toast.success('Account created! Welcome to FieldOps.');
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-glow auth-glow-1" />
      <div className="auth-glow auth-glow-2" />

      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">FO</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>FieldOps</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Field Service Management</div>
          </div>
        </div>

        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Join your team on FieldOps</p>

        {error && <div className="auth-error">⚠️ {error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full name</label>
            <input id="name" className="form-input" name="name" placeholder="John Smith" value={form.name} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">Email address</label>
            <input id="reg-email" className="form-input" type="email" name="email" placeholder="you@company.com" value={form.email} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">Password</label>
            <input id="reg-password" className="form-input" type="password" name="password" placeholder="••••••• (min 6 chars)" value={form.password} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="role">I am a...</label>
            <select id="role" className="form-select" name="role" value={form.role} onChange={handleChange}>
              <option value="CLIENT">Client (I request services)</option>
              <option value="TECHNICIAN">Technician (I perform field jobs)</option>
            </select>
          </div>

          {form.role === 'TECHNICIAN' && (
            <div className="form-group" style={{ animation: 'fadeIn 0.3s ease' }}>
              <label className="form-label">My Specializations (Select all that apply)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', background: 'var(--bg-elevated)', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                {availableFields.map(field => (
                  <label key={field} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={form.fields.includes(field)} 
                      onChange={() => handleFieldToggle(field)}
                      style={{ accentColor: 'var(--primary)' }}
                    />
                    {field}
                  </label>
                ))}
              </div>
            </div>
          )}

          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? <><div className="spinner" style={{ width: 18, height: 18 }} /> Creating account...</> : 'Create Account →'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

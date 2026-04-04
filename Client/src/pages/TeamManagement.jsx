import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function TeamManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = () => {
    // We filter out ADMINs since admin should not toggle themselves or other admins
    api.get('/users')
      .then(res => setUsers(res.data.users.filter(u => u.role !== 'ADMIN')))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/users/${id}/status`);
      toast.success(currentStatus ? 'User deactivated' : 'User approved / activated');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <div className="loading-center"><div className="spinner spinner-lg" /></div>;

  const getStatusBadge = (user) => {
    if (user.isActive) return <span className="badge badge-completed">Active</span>;
    if (user.role === 'TECHNICIAN' && !user.isActive) return <span className="badge badge-pending">Pending Approval</span>;
    return <span className="badge badge-cancelled">Inactive</span>;
  };

  return (
    <div className="container" style={{ maxWidth: 1000 }}>
      <div className="page-header">
        <div className="page-title">
          <h1>Team Management</h1>
          <p>Approve technicians and manage client accounts</p>
        </div>
      </div>

      <div className="card">
        {users.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No users found</h3>
            <p>Users will appear here when they register.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Name</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Email</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Role</th>
                  <th style={{ padding: '1rem', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '1rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{user.name}</td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{user.email}</td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge" style={{ backgroundColor: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>{getStatusBadge(user)}</td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button 
                        className={`btn btn-${user.isActive ? 'danger' : 'success'} btn-sm`}
                        onClick={() => handleToggleStatus(user._id, user.isActive)}
                      >
                        {user.isActive ? 'Deactivate' : 'Approve'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

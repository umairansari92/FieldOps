import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Modal from './Modal';
import toast from 'react-hot-toast';

export default function NotificationBell() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const ref = useRef(null);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = async () => {
    await api.patch('/notifications/mark-all-read');
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleNotifClick = async (n) => {
    setOpen(false);
    setSelectedNotif(n);
    setModalOpen(true);

    if (!n.read) {
      try {
        await api.patch(`/notifications/${n._id}/read`);
        setNotifications(prev => prev.map(item => item._id === n._id ? { ...item, read: true } : item));
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error('Failed to mark read', err);
      }
    }
  };

  const handleApproveTech = async (userId) => {
    try {
      await api.patch(`/users/${userId}/status`);
      toast.success('Technician approved successfully!');
      setModalOpen(false);
    } catch (err) {
      toast.error('Failed to approve technician');
    }
  };

  const formatTime = (date) => {
    const d = new Date(date);
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button className="notif-bell" onClick={() => setOpen(!open)} aria-label="Notifications">
        🔔
        {unreadCount > 0 && (
          <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Notifications</span>
            {unreadCount > 0 && (
              <button className="btn btn-sm btn-secondary" onClick={markAllRead} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}>
                Mark all read
              </button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div 
                  key={n._id} 
                  className={`notif-item ${!n.read ? 'unread' : ''}`}
                  onClick={() => handleNotifClick(n)}
                >
                  <div className="notif-dot" />
                  <div>
                    <div className="notif-text">{n.message}</div>
                    <div className="notif-time">{formatTime(n.createdAt)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Notification Action Modal */}
      <Modal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        title="Notification Details"
        footer={
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', width: '100%' }}>
            {selectedNotif?.type === 'TECH_SIGNUP' && (
              <button className="btn btn-success" onClick={() => handleApproveTech(selectedNotif.sender?._id)}>
                Approve Now
              </button>
            )}
            {selectedNotif?.job && (
              <button className="btn btn-primary" onClick={() => { setModalOpen(false); navigate(`/jobs/${selectedNotif.job._id}`); }}>
                Go to Job
              </button>
            )}
            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Close</button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>{selectedNotif?.message}</div>
          
          {selectedNotif?.sender && (
            <div className="card" style={{ padding: '0.75rem', background: 'var(--bg-elevated)', border: 'none' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Sender Details</div>
              <div style={{ fontWeight: 600 }}>{selectedNotif.sender.name}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{selectedNotif.sender.email} · {selectedNotif.sender.role}</div>
            </div>
          )}

          {selectedNotif?.job && (
            <div className="card" style={{ padding: '0.75rem', background: 'var(--bg-elevated)', border: 'none' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Related Job</div>
              <div style={{ fontWeight: 600 }}>{selectedNotif.job.title}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ID: {selectedNotif.job._id}</div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}

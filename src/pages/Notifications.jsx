import { useEffect, useState } from 'react';
import { authAxios } from '../App';
import Sidebar from '../components/Sidebar';
import { toast } from 'sonner';
import { Bell, Check, CheckCheck, AlertTriangle, Link2, Trash2, ExternalLink, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Notifications({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const response = await authAxios.get('/notifications');
      setNotifications(response.data);
    } catch (error) {
      toast.error('Error loading notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await authAxios.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      toast.error('Error marking as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await authAxios.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch (error) {
      toast.error('Error marking all as read');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      await authAxios.delete(`/notifications/${id}`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Error deleting notification');
    }
  };

  const handleViewDetails = (notification) => {
    // Marcar como leída si no lo está
    if (!notification.isRead) {
      handleMarkAsRead(notification._id);
    }

    // Navegar según el tipo de notificación
    if (notification.type === 'missing-parts' && notification.truckNumber) {
      // Admin ve la lista de missing parts del camión
      navigate(`/missing-parts/${notification.truckNumber}`);
    } else if (notification.relatedGigId) {
      navigate(`/gig/${notification.relatedGigId}`);
    } else if (notification.relatedTaskId) {
      navigate(`/task/${notification.relatedTaskId}`);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'missing-parts':
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case 'depends-previous-station':
        return <Link2 className="w-6 h-6 text-blue-500" />;
      default:
        return <Bell className="w-6 h-6 text-gray-500" />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead;
    if (filter === 'read') return n.isRead;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex">
        <Sidebar user={user} />
        <div className="flex-1 ml-64 p-8 lg:p-12 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#FF5722] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar user={user} />
      <div className="flex-1 ml-64 p-8 lg:p-12 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-heading font-black text-4xl uppercase tracking-tight text-slate-900 mb-2">
              Notifications
            </h1>
            <p className="text-slate-600">
              {unreadCount > 0 ? `${unreadCount} unread notifications` : 'No unread notifications'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <CheckCheck size={18} />
              Mark all as read
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['all', 'unread', 'read'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-lg transition-all ${
                filter === f
                  ? 'bg-slate-900 text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No notifications to show</p>
            </div>
          ) : (
            filteredNotifications.map(notification => (
              <div
                key={notification._id}
                className={`bg-white rounded-lg p-6 shadow-sm transition-all hover:shadow-md ${
                  !notification.isRead ? 'border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className={`font-semibold ${!notification.isRead ? 'text-slate-900' : 'text-slate-600'}`}>
                        {notification.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="p-1 hover:bg-slate-100 rounded"
                            title="Mark as read"
                          >
                            <Check className="w-4 h-4 text-slate-400" />
                          </button>
                        )}
                        {(user.role === 'qc' || user.role === 'admin') && (
                          <button
                            onClick={() => handleDelete(notification._id)}
                            className="p-1 hover:bg-red-50 rounded"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-slate-500 mt-1">{notification.message}</p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                      <span>{new Date(notification.createdAt).toLocaleString()}</span>
                      {notification.station && (
                        <span className="bg-slate-100 px-2 py-1 rounded">{notification.station}</span>
                      )}
                      {notification.truckNumber && (
                        <span className="bg-orange-100 text-orange-600 px-2 py-1 rounded">#{notification.truckNumber}</span>
                      )}
                    </div>
                    {notification.pausedBy && (
                      <p className="text-xs text-slate-400 mt-2">
                        Paused by: {notification.pausedBy.workerName} ({notification.pausedBy.workerNumber})
                      </p>
                    )}

                    {/* Action Button */}
                    <div className="mt-4">
                      <button
                        onClick={() => handleViewDetails(notification)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium"
                      >
                        {notification.type === 'missing-parts' ? (
                          <>
                            <Package size={16} />
                            View Missing Parts List
                          </>
                        ) : (
                          <>
                            <ExternalLink size={16} />
                            View Details
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

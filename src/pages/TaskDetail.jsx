import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authAxios } from '../App';
import Sidebar from '../components/Sidebar';
import { toast } from 'sonner';
import { ArrowLeft, Clock, User, CheckCircle, Pause, Play, Image as ImageIcon } from 'lucide-react';
import WorkerActionModal from '../components/WorkerActionModal';

export default function TaskDetail({ user }) {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workerActionModal, setWorkerActionModal] = useState({
    isOpen: false,
    action: null
  });

  useEffect(() => {
    loadTask();
  }, [taskId]);

  const loadTask = async () => {
    try {
      const response = await authAxios.get(`/tasks/${taskId}`);
      setTask(response.data);
    } catch (error) {
      toast.error('Error loading task');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const openWorkerActionModal = (action) => {
    setWorkerActionModal({
      isOpen: true,
      action
    });
  };

  const handleWorkerAction = async (data) => {
    try {
      const { action } = workerActionModal;

      if (action === 'start') {
        await authAxios.post(`/tasks/${taskId}/start`, data);
        toast.success('Task started');
      } else if (action === 'complete') {
        await authAxios.post(`/tasks/${taskId}/complete`, data);
        toast.success('Task completed');
      } else if (action === 'pause') {
        await authAxios.post(`/tasks/${taskId}/pause`, data);
        toast.success('Task paused - Notification sent to Lead');
      }

      loadTask();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error processing action');
    }
  };

  const getStatusBadgeClass = (status) => {
    const classes = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'paused': 'bg-orange-100 text-orange-800'
    };
    return classes[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-[#FF5722] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Task not found</p>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar user={user} />
      <div className="flex-1 ml-64 p-8 lg:p-12 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="font-heading font-black text-3xl uppercase tracking-tight text-slate-900 mb-2">
                {task.taskName}
              </h1>
              <p className="text-slate-600">
                Station: {task.station} | Truck: #{task.truckNumber}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeClass(task.status)}`}>
              {task.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4">Description</h3>
              <p className="text-slate-600 whitespace-pre-wrap">{task.description}</p>
            </div>

            {/* Photos */}
            {task.photos && task.photos.length > 0 && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4">Photos</h3>
                <div className="grid grid-cols-3 gap-4">
                  {task.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`Task photo ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => window.open(photo, '_blank')}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Paused Info */}
            {task.status === 'paused' && task.pausedInfo && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="font-semibold text-orange-800 mb-4 flex items-center gap-2">
                  <Pause size={20} />
                  Task Paused
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Reason:</strong> {task.pausedInfo.reason === 'missing-parts' ? 'Missing Parts' : task.pausedInfo.reason === 'depends-previous-station' ? 'Depends on Previous Station' : 'Other'}</p>
                  {task.pausedInfo.note && <p><strong>Note:</strong> {task.pausedInfo.note}</p>}
                  <p><strong>Paused by:</strong> {task.pausedInfo.pausedBy?.workerName} ({task.pausedInfo.pausedBy?.workerNumber})</p>
                  <p><strong>Paused at:</strong> {new Date(task.pausedInfo.pausedAt).toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Details Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4">Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer</span>
                  <span className="font-medium">{task.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sales Eng.</span>
                  <span className="font-medium">{task.salesEng}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Work Order</span>
                  <span className="font-medium">{task.workOrder || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Created</span>
                  <span className="font-medium">{new Date(task.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            {(user.role === 'worker' || user.role === 'lead') && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-slate-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  {task.status === 'pending' && (
                    <button
                      onClick={() => openWorkerActionModal('start')}
                      className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Play size={18} />
                      Start Task
                    </button>
                  )}
                  {task.status === 'in-progress' && (
                    <>
                      <button
                        onClick={() => openWorkerActionModal('complete')}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle size={18} />
                        Complete Task
                      </button>
                      <button
                        onClick={() => openWorkerActionModal('pause')}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                      >
                        <Pause size={18} />
                        Pause Task
                      </button>
                    </>
                  )}
                  {task.status === 'paused' && (
                    <button
                      onClick={() => openWorkerActionModal('start')}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Play size={18} />
                      Restart Task
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Worker Action Modal */}
      <WorkerActionModal
        isOpen={workerActionModal.isOpen}
        onClose={() => setWorkerActionModal({ ...workerActionModal, isOpen: false })}
        onConfirm={handleWorkerAction}
        action={workerActionModal.action}
        gigInfo={{
          truckNumber: task.truckNumber,
          station: task.station
        }}
      />
    </div>
  );
}
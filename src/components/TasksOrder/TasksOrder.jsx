import { useEffect, useState } from 'react';
import { authAxios } from '../../App';
import Sidebar from '../../components/Sidebar';
import styles from '../../pages/statistics.module.css';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { Pencil, Trash2, Plus, Image as ImageIcon, Play, CheckCircle, Pause, Star, XCircleIcon, CheckCircle2Icon } from 'lucide-react';
import WorkerActionModal from '../../components/WorkerActionModal';
import CreateTaskModal from './CreateTeaskModal';


export default function TasksOrder({ user }) {
  const navigate = useNavigate();
  const { wkorder } = useParams();
  const [tasks, setTasks] = useState([]);
  const [operators, setOperators] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [workerActionModal, setWorkerActionModal] = useState({
    isOpen: false,
    action: null,
    taskId: null,
    taskInfo: null
  });

  useEffect(() => {
    loadData(wkorder);
  }, [wkorder]);

  const loadData = async (wkorder) => {
    try {
      const [tasksRes, operatorsRes] = await Promise.all([
        authAxios.get('/tasks/'),
        authAxios.get('/operators'),
      ]);

      setTasks(tasksRes.data.tasks.filter(task => task.truckNumber === wkorder));
      setOperators(operatorsRes.data);
    } catch (error) {
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleOperatorChange = async (taskId, employeeNumber) => {
    try {
      await authAxios.put(`/tasks/${taskId}`, { employeeNumber });
      setTasks(prev =>
        prev.map(task =>
          task._id === taskId ? { ...task, employeeNumber } : task
        )
      );
      toast.success('Operator assigned');
    } catch (error) {
      toast.error('Error assigning operator');
    }
  };

  const customerWK = tasks.find(task => task.truckNumber === wkorder)?.customerName || '';
  const salesEng = tasks.find(task => task.truckNumber === wkorder)?.salesEng || '';

  const getStatusBadgeClass = (status) => {
    const classes = {
      'pending': 'status-pending',
      'in-progress': 'status-in-progress',
      'completed': 'status-completed',
      'paused': 'bg-blue-100 text-blue-800 border-blue-300',
      'approved': 'bg-green-100 text-green-800 border-green-300',
      'rejected': 'bg-red-100 text-red-800 border-red-300'
    };
    return `status-badge ${classes[status] || ''}`;
  };

  const getStatusText = (status) => {
    const texts = {
      'pending': 'Pending',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'paused': 'Paused'
    };
    return texts[status] || status;
  };

  const handleDelete = async (taskId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this task?')) return;

    try {
      await authAxios.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Error deleting task');
    }
  };

  const handleEdit = (task, e) => {
    e.stopPropagation();
    setEditingTask(task);
    setShowModal(true);
  };

  const handleApproved = async (taskId, e) => {
    e.stopPropagation();
    try {
      await authAxios.post(`/tasks/${taskId}/approved`, 'approved');
      toast.success('Task Approved');
      loadData(wkorder);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error processing action');
    }
  };

  const handleRejected = async (taskId, e) => {
    e.stopPropagation();
    try {
      await authAxios.post(`/tasks/${taskId}/rejected`, { inspectionStatus: 'rejected', status: 'pending' });
      toast.success('Task Rejected');
      loadData(wkorder);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error processing action');
    }
  };

  const openWorkerActionModal = (action, task, e) => {
    e.stopPropagation();
    setWorkerActionModal({
      isOpen: true,
      action,
      taskId: task._id,
      taskInfo: {
        truckNumber: task.truckNumber,
        station: task.station,
        taskName: task.taskName
      }
    });
  };

  const handleWorkerAction = async (data) => {
    try {
      const { action, taskId } = workerActionModal;

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

      loadData(wkorder);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error processing action');
    }
  };

  const handlePhotoClick = (photoUrl, e) => {
    e.stopPropagation();
    setPhotoPreview(photoUrl);
  };

  const filteredTasks = tasks.filter(task => {
    return filterStatus === 'all' || task.status === filterStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-[#FF5722] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={styles.appContainer}>
      <div className={styles.sidebar}>
        <Sidebar user={user} />
      </div>

      <div className="flex-1 ml-54 p-8 lg:p-12 bg-gray-50 min-h-screen">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-heading font-black text-4xl uppercase tracking-tight text-slate-900 mb-2">
              STATION DEFAULT TASKS
            </h1>
            <h4 className="font-heading font-black text-2xl uppercase tracking-tight text-slate-800 mb-2">
              Work Order # {wkorder}
            </h4>
            <h4>Customer: {customerWK}</h4>
            <h4>Sales. Eng: {salesEng}</h4>
          </div>
          {user.role === 'qc' && (
            <button
              onClick={() => {
                setEditingTask(null);
                setShowModal(true);
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              New Task
            </button>
          )}
        </div>

        <div className={styles.dashboard}>
          <div className="mb-6 flex flex-wrap gap-4 items-end">
            <div className="flex gap-2">
              {['all', 'pending', 'in-progress', 'completed', 'paused'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-sm transition-all ${
                    filterStatus === status
                      ? 'bg-[#ff2222] text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {status === 'all' ? 'All' :
                   status === 'pending' ? 'Pending' :
                   status === 'in-progress' ? 'In Progress' :
                   status === 'completed' ? 'Completed' : 'Paused'}
                </button>
              ))}
            </div>
          </div>

          <div className="table-container">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-header text-left">Items #</th>
                  <th className="table-header text-left">Task Name</th>
                  <th className="table-header text-left">Station</th>
                  <th className="table-header text-left">Description</th>
                  <th className="table-header text-left">Photo</th>
                  <th className="table-header text-left">Status</th>
                  <th className="table-header text-left">Pass</th>
                  <th className="table-header text-left">Fail</th>
                  <th className="table-header text-left">Operator</th>
                  <th className="table-header text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task, index) => (
                  <tr
                    key={task._id}
                    className="table-row fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="p-4 font-mono text-sm font-bold text-slate-900">{index + 1}</td>
                    <td className="p-4 font-mono text-sm font-bold text-slate-900">{task.taskName}</td>
                    <td className="p-4 font-mono text-sm font-medium text-slate-900">{task.station}</td>
                    <td className="p-4 font-body text-sm text-slate-800 whitespace-normal break-words max-w-xs">
                      {task.description.length > 200 ? `${task.description.substring(0, 200)}...` : task.description}
                    </td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      {task.photos && task.photos.length > 0 ? (
                        <button
                          onClick={(e) => handlePhotoClick(task.photos[0], e)}
                          className="w-12 h-12 rounded-sm overflow-hidden border border-slate-200 hover:border-[#FF5722] transition-colors"
                        >
                          <img src={task.photos[0]} alt="Thumbnail" className="w-full h-full object-cover" />
                        </button>
                      ) : (
                        <div className="w-12 h-12 rounded-sm bg-slate-100 flex items-center justify-center border border-slate-200">
                          <ImageIcon size={20} className="text-slate-400" />
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <span className={getStatusBadgeClass(task.status)}>
                        {getStatusText(task.status)}
                      </span>
                    </td>
                    <td className="p-4">
                      {task.inspectionStatus === 'approved' && (
                        <span className={getStatusBadgeClass(task.inspectionStatus)}>APPROVED</span>
                      )}
                    </td>
                    <td className="p-4">
                      {task.inspectionStatus === 'rejected' && (
                        <span className={getStatusBadgeClass(task.inspectionStatus)}>
                          <Star className="w-6 h-6 text-red-500 fill-yellow-500" />
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {user.role === 'lead' ? (
                        <select
                          className="input-field"
                          value={task.employeeNumber || ''}
                          onChange={(e) => handleOperatorChange(task._id, e.target.value)}
                        >
                          <option>Unassigned</option>
                          {operators
                            .filter(op => op.station === task.station)
                            .map(operator => (
                              <option key={operator.employeeNumber} value={operator.employeeNumber}>
                                {operator.fullName}
                              </option>
                            ))}
                        </select>
                      ) : (
                        <span className="font-body text-sm text-slate-600">
                          {operators.find(op => op.employeeNumber === task.employeeNumber)?.fullName || 'Unassigned'}
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2 flex-wrap">
                        {(user.role === 'worker' || user.role === 'lead') && (
                          <>
                            {task.status === 'pending' && (
                              <button
                                onClick={(e) => openWorkerActionModal('start', task, e)}
                                className="px-3 py-1 bg-orange-500 text-white text-xs font-bold uppercase rounded-sm hover:bg-orange-600 transition-colors flex items-center gap-1"
                              >
                                <Play size={14} /> Start
                              </button>
                            )}
                            {task.status === 'in-progress' && (
                              <>
                                <button
                                  onClick={(e) => openWorkerActionModal('complete', task, e)}
                                  className="px-3 py-1 bg-green-600 text-white text-xs font-bold uppercase rounded-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                                >
                                  <CheckCircle size={14} /> Complete
                                </button>
                                <button
                                  onClick={(e) => openWorkerActionModal('pause', task, e)}
                                  className="px-3 py-1 bg-blue-600 text-white text-xs font-bold uppercase rounded-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
                                >
                                  <Pause size={14} /> Pause
                                </button>
                              </>
                            )}
                            {task.status === 'paused' && (
                              <button
                                onClick={(e) => openWorkerActionModal('start', task, e)}
                                className="px-3 py-1 bg-blue-600 text-white text-xs font-bold uppercase rounded-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
                              >
                                <Play size={14} /> Restart
                              </button>
                            )}
                          </>
                        )}

                        {user.role === 'qc' && (task.status === 'pending' || task.status === 'in-progress') && (
                          <>
                            <button onClick={(e) => handleEdit(task, e)} className="p-2 hover:bg-slate-100 rounded transition-colors">
                              <Pencil size={16} className="w-6 h-6 text-slate-600" />
                            </button>
                            <button onClick={(e) => handleDelete(task._id, e)} className="p-2 hover:bg-red-50 rounded transition-colors">
                              <Trash2 size={16} className="w-6 h-6 text-red-600" />
                            </button>
                          </>
                        )}

                        {user.role === 'qc' && task.status === 'completed' && (
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => handleApproved(task._id, e)}
                              disabled={task.inspectionStatus === 'approved'}
                              className={`p-2 rounded transition-colors ${task.inspectionStatus === 'approved' ? 'bg-green-100 cursor-not-allowed opacity-60' : 'hover:bg-green-50'}`}
                            >
                              <CheckCircle2Icon className="w-6 h-6 text-green-500" />
                            </button>
                            <button
                              onClick={(e) => handleRejected(task._id, e)}
                              disabled={task.inspectionStatus === 'rejected'}
                              className={`p-2 rounded transition-colors ${task.inspectionStatus === 'rejected' ? 'bg-red-100 cursor-not-allowed opacity-60' : 'hover:bg-red-50'}`}
                            >
                              <XCircleIcon className="w-6 h-6 text-red-500" />
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {user.role === 'qc' && showModal && (
        <CreateTaskModal
          user={user}
          wkorder={wkorder}
          customerWK={customerWK}
          salesEng={salesEng}
          onClose={() => {
            setShowModal(false);
            setEditingTask(null);
          }}
          onSuccess={() => {
            loadData(wkorder);
            setShowModal(false);
            setEditingTask(null);
          }}
          editingTask={editingTask}
        />
      )}

      <WorkerActionModal
        isOpen={workerActionModal.isOpen}
        onClose={() => setWorkerActionModal({ ...workerActionModal, isOpen: false })}
        onConfirm={handleWorkerAction}
        action={workerActionModal.action}
        gigInfo={workerActionModal.taskInfo}
      />

      {photoPreview && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setPhotoPreview(null)}>
          <div className="relative max-w-4xl max-h-[90vh]">
            <button onClick={() => setPhotoPreview(null)} className="absolute -top-12 right-0 p-2 bg-white rounded-sm hover:bg-slate-100 transition-colors">X</button>
            <img src={photoPreview} alt="Preview" className="max-w-full max-h-[90vh] rounded-sm" onClick={(e) => e.stopPropagation()} />
          </div>
        </div>
      )}
    </div>
  );
}

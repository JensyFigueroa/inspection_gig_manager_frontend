import { useState, useEffect } from 'react';
import { X, Upload, Trash2 } from 'lucide-react';
import { authAxios } from '../../App';
import { toast } from 'sonner';

const STATIONS = [
  'Station 1',
  'Station 2',
  'Station 3',
  'Station 4',
  'Station 5',
  'Station 6',
  'Electrico T/S',
  'Harness',
  'Prep',
  'Cab Shop',
  'Body Shop',
  'Paint'
];

// Default tasks por estación
const DEFAULT_TASKS_BY_STATION = {
  'Station 1': [
    { taskName: 'Frame Inspection', description: 'Inspect frame for damage and alignment' },
    { taskName: 'Mounting Points Check', description: 'Verify all mounting points are secure' },
    { taskName: 'Initial Assembly', description: 'Begin initial component assembly' }
  ],
  'Station 2': [
    { taskName: 'Electrical Routing', description: 'Route main electrical harness' },
    { taskName: 'Connection Points', description: 'Secure all connection points' },
    { taskName: 'Wire Management', description: 'Organize and secure wire bundles' }
  ],
  'Station 3': [
    { taskName: 'Hydraulic Lines', description: 'Install hydraulic lines' },
    { taskName: 'Pressure Test', description: 'Perform pressure test on system' },
    { taskName: 'Fitting Check', description: 'Verify all fittings are tight' }
  ],
  'Station 4': [
    { taskName: 'Panel Installation', description: 'Install body panels' },
    { taskName: 'Alignment Check', description: 'Check panel alignment' },
    { taskName: 'Gap Measurement', description: 'Measure and adjust gaps' }
  ],
  'Station 5': [
    { taskName: 'Final Assembly', description: 'Complete final assembly tasks' },
    { taskName: 'Component Test', description: 'Test all components' },
    { taskName: 'Documentation', description: 'Complete assembly documentation' }
  ],
  'Station 6': [
    { taskName: 'Quality Check', description: 'Perform quality inspection' },
    { taskName: 'Final Inspection', description: 'Complete final inspection' },
    { taskName: 'Sign-off', description: 'Sign-off on completed work' }
  ]
};

export default function CreateTaskModal({
  onClose,
  onSuccess,
  editingTask,
  user,
  wkorder,
  customerWK,
  salesEng
}) {
  const [formData, setFormData] = useState({
    station: '',
    taskName: '',
    description: '',
    truckNumber: wkorder || '',
    customerName: customerWK || '',
    salesEng: salesEng || '',
    workOrder: wkorder || ''
  });
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableDefaultTasks, setAvailableDefaultTasks] = useState([]);

  useEffect(() => {
    if (editingTask) {
      setFormData({
        station: editingTask.station || '',
        taskName: editingTask.taskName || '',
        description: editingTask.description || '',
        truckNumber: editingTask.truckNumber || wkorder || '',
        customerName: editingTask.customerName || customerWK || '',
        salesEng: editingTask.salesEng || salesEng || '',
        workOrder: editingTask.workOrder || wkorder || ''
      });
      setPhotos(editingTask.photos || []);
    }
  }, [editingTask, wkorder, customerWK, salesEng]);

  useEffect(() => {
    // Update available default tasks when station changes
    if (formData.station && DEFAULT_TASKS_BY_STATION[formData.station]) {
      setAvailableDefaultTasks(DEFAULT_TASKS_BY_STATION[formData.station]);
    } else {
      setAvailableDefaultTasks([]);
    }
  }, [formData.station]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDefaultTaskSelect = (task) => {
    setFormData(prev => ({
      ...prev,
      taskName: task.taskName,
      description: task.description
    }));
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'ml_default');

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: 'POST', body: formData }
        );
        const data = await response.json();
        return data.secure_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setPhotos(prev => [...prev, ...uploadedUrls]);
      toast.success('Photos uploaded successfully');
    } catch (error) {
      toast.error('Error uploading photos');
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const taskData = {
        ...formData,
        photos,
        isDefaultTask: true
      };

      if (editingTask) {
        await authAxios.put(`/tasks/${editingTask._id}`, taskData);
        toast.success('Task updated successfully');
      } else {
        await authAxios.post('/tasks', taskData);
        toast.success('Task created successfully');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error saving task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="border-b border-slate-200 p-6 flex justify-between items-center sticky top-0 bg-white">
          <div>
            <h2 className="font-heading font-bold text-xl text-slate-900">
              {editingTask ? 'Edit Task' : 'Create New Task'}
            </h2>
            {wkorder && (
              <p className="text-sm text-slate-500">Work Order: #{wkorder}</p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded transition-colors">
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Station Selection */}
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
              Station *
            </label>
            <select
              name="station"
              value={formData.station}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Select station...</option>
              {STATIONS.map(station => (
                <option key={station} value={station}>{station}</option>
              ))}
            </select>
          </div>

          {/* Default Tasks Selector */}
          {availableDefaultTasks.length > 0 && !editingTask && (
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
                Quick Select - Default Tasks for {formData.station}
              </label>
              <div className="flex flex-wrap gap-2">
                {availableDefaultTasks.map((task, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDefaultTaskSelect(task)}
                    className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                      formData.taskName === task.taskName
                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {task.taskName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Task Name */}
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
              Task Name *
            </label>
            <input
              type="text"
              name="taskName"
              value={formData.taskName}
              onChange={handleChange}
              className="input-field"
              placeholder="Enter task name..."
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="input-field min-h-[100px] resize-none"
              placeholder="Enter task description..."
              required
            />
          </div>

          {/* Truck Number */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
                Truck Number *
              </label>
              <input
                type="text"
                name="truckNumber"
                value={formData.truckNumber}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., 697839"
                required
                readOnly={!!wkorder}
              />
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
                Work Order
              </label>
              <input
                type="text"
                name="workOrder"
                value={formData.workOrder}
                onChange={handleChange}
                className="input-field"
                placeholder="Work order number"
                readOnly={!!wkorder}
              />
            </div>
          </div>

          {/* Customer & Sales Eng */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
                Customer Name *
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                className="input-field"
                placeholder="Customer name"
                required
                readOnly={!!customerWK}
              />
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
                Sales Engineer *
              </label>
              <input
                type="text"
                name="salesEng"
                value={formData.salesEng}
                onChange={handleChange}
                className="input-field"
                placeholder="Sales engineer"
                required
                readOnly={!!salesEng}
              />
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
              Photos
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-4">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload-task"
                disabled={uploading}
              />
              <label
                htmlFor="photo-upload-task"
                className="flex flex-col items-center cursor-pointer"
              >
                <Upload className={`w-8 h-8 ${uploading ? 'text-slate-300' : 'text-slate-400'}`} />
                <span className="text-sm text-slate-500 mt-2">
                  {uploading ? 'Uploading...' : 'Click to upload photos'}
                </span>
              </label>
            </div>

            {photos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-md border border-slate-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 btn-primary"
            >
              {loading ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

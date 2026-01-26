import { useState, useEffect } from 'react';
import { authAxios } from '../App';
import { toast } from 'sonner';
import { X } from 'lucide-react';
import PhotoUploader from './PhotoUploader';

export default function CreateGigModal({ onClose, onSuccess, inspectors, editingGig, user }) {

  const dateNow = new Date()

  const [formData, setFormData] = useState({
    station: '',
    description: '',
    truckNumber: '', 
    status: 'pending',
    inspectorId: '',
    employeeNumber: 'Unassigned',
    photos: []
  });
  const [loading, setLoading] = useState(false);
 
  useEffect(() => {
    if (editingGig) {
      setFormData({
        station: editingGig.station,
        description: editingGig.description,
        truckNumber: editingGig.truckNumber || '',
        status: editingGig.status,
        inspectorId: editingGig.inspectorId || '',
        employeeNumber: editingGig.employeeNumber || 'Unassigned',
        photos: editingGig.photos || []
      });
    }
  }, [editingGig]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        inspectorId: user.id || null,
        // inspectionDate: formData.inspectionDate ? new Date(formData.inspectionDate).toISOString() : null
      };

      if (editingGig) {
        await authAxios.put(`/gigs/${editingGig._id}`, payload);
        toast.success('Updated gig');
      } else {
        await authAxios.post('/gigs', payload);
        toast.success('Gig created');
      }
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error saving gig');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotosChange = (newPhotos) => {
    setFormData({ ...formData, photos: newPhotos });
  };

  const stations = [
    'Station 1',
    'Station 2',
    'Station 3',
    'Station 4',
    'Station 5',
    'Station 6',
    'Station 7',
    'Station 8',
    'Station 9',
    'Station 10',
    'Final Station ',
    
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
          <h2 className="font-heading font-bold text-2xl text-slate-900">
            {editingGig ? 'Edit Gig' : 'New Gig'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded transition-colors">
            <X size={24} className="text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
                Truck Number *
              </label>
              <input
                type="Number"
                className="input-field"
                placeholder="e.g: 245001"
                value={formData.truckNumber}
                onChange={(e) => setFormData({ ...formData, truckNumber: e.target.value })}
                required
              />
            </div>            
          </div>

          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
              Station *
            </label>
            <select
              className="input-field"
              value={formData.station}
              onChange={(e) => setFormData({ ...formData, station: e.target.value })}
              required
            >
              <option value="">Select station...</option>
              {stations.map((station) => (
                <option key={station} value={station}>
                  {station}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
              Description *
            </label>
            <textarea
              className="input-field min-h-[100px] resize-none"
              placeholder="Describe gig..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* <div>
              <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
                Status
              </label>
              <span>{formData.status}</span>
              <select
                className="input-field"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="blocked">Blocked</option>
              </select>
            </div> */}

            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
                Inspector
              </label>
              <span>{user.name}</span>
              {/* <select
                className="input-field"
                value={formData.inspectorId}
                onChange={(e) => setFormData({ ...formData, inspectorId: e.target.value })}
              >
                <option value="">Unassigned</option>
                {inspectors.map((inspector) => (
                  <option key={inspector._id} value={inspector._id}>
                    {inspector.name}
                  </option>
                ))}
              </select> */}
            </div>
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
                Inpection Date
              </label>
              <span>{dateNow.toLocaleDateString('en-US')}</span>
              {/* <input
                type="date"
                className="input-field"
                value={formData.inspectionDate}
                onChange={(e) => setFormData({ ...formData, inspectionDate: e.target.value })}
              /> */}
            </div>

            
          </div>  

          <PhotoUploader 
            photos={formData.photos}
            onPhotosChange={handlePhotosChange}
          />

          <div className="flex gap-2 pt-4 border-t border-slate-200">
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? 'Saving...' : (editingGig ? 'Update Gig' : 'Create Gig')}
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
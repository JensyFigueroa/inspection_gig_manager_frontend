import { useState, useEffect } from 'react';
import { authAxios } from '../App';
import { toast } from 'sonner';
import { X, UserPlus } from 'lucide-react';

export default function AssignWorkerModal({ isOpen, onClose, onSuccess, gig }) {
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadWorkers();
      setSelectedWorker(gig?.assignedTo?._id || '');
    }
  }, [isOpen, gig]);

  const loadWorkers = async () => {
    try {
      const response = await authAxios.get('/auth/workers');
      setWorkers(response.data);
    } catch (error) {
      toast.error('Error al cargar workers');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAxios.put(`/gigs/${gig._id}`, {
        assignedTo: selectedWorker || null
      });
      toast.success(selectedWorker ? 'Worker asignado' : 'Asignación removida');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al asignar');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-sm max-w-md w-full">
        <div className="border-b border-slate-200 p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <UserPlus size={24} className="text-blue-600" />
            <div>
              <h2 className="font-heading font-bold text-xl text-slate-900">
                Asignar Worker
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Truck: {gig?.truckNumber} - {gig?.station}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded transition-colors">
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
              Seleccionar Worker
            </label>
            <select
              className="input-field"
              value={selectedWorker}
              onChange={(e) => setSelectedWorker(e.target.value)}
              autoFocus
            >
              <option value="">Sin asignar</option>
              {workers.map((worker) => (
                <option key={worker._id} value={worker._id}>
                  {worker.name} - {worker.email}
                </option>
              ))}
            </select>
            <p className="font-mono text-xs text-slate-500 mt-2">
              {workers.length === 0 
                ? 'No hay workers disponibles en esta estación'
                : `${workers.length} worker(s) disponible(s)`}
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={loading}
            >
              {loading ? 'Asignando...' : 'Asignar'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
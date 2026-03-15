import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { authAxios } from '../App';

const STATIONS = [
  'Station 1', 'Station 2', 'Station 3', 'Station 4', 'Station 5', 'Station 6','Station 9', 'Final Station',
  'Electrico T/S', 'Harness', 'Prep', 'Cab Shop', 'Body Shop', 'Paint'
];

export default function WorkerActionModal({
  isOpen,
  onClose,
  onConfirm,
  action,
  gigInfo
}) {
  const [workerNumber, setWorkerNumber] = useState('');
  const [workerName, setWorkerName] = useState('');
  const [reason, setReason] = useState('missing-parts');
  const [note, setNote] = useState('');
  const [dependsOnStation, setDependsOnStation] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados para autocompletado de empleado
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [employeeStatus, setEmployeeStatus] = useState(null);
  const [debounceTimer, setDebounceTimer] = useState(null);

  // Efecto para buscar empleado
  useEffect(() => {
    if (debounceTimer) clearTimeout(debounceTimer);

    if (!workerNumber || workerNumber.length < 2) {
      setEmployeeStatus(null);
      return;
    }

    const timer = setTimeout(() => {
      searchEmployee(workerNumber);
    }, 500);

    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [workerNumber]);

  const searchEmployee = async (number) => {
    try {
      setEmployeeLoading(true);
      const response = await authAxios.get(`/suggestions/operators/search?employeeNumber=${number}`);
      
      if (response.data.found) {
        setEmployeeStatus('found');
        setWorkerName(response.data.operator.fullName);
      } else {
        setEmployeeStatus('not-found');
        setWorkerName('');
      }
    } catch (error) {
      console.error('Error searching employee:', error);
      setEmployeeStatus(null);
    } finally {
      setEmployeeLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validaciones
    if (employeeStatus === 'not-found') {
      alert('Employee Number not found. Please contact your Lead.');
      return;
    }

    if (action === 'pause' && reason === 'depends-previous-station' && !dependsOnStation) {
      alert('Please select the station this task depends on');
      return;
    }

    if (action === 'pause' && reason === 'missing-parts' && !note.trim()) {
      alert('Please describe the missing part');
      return;
    }
    
    setLoading(true);

    const data = {
      workerNumber,
      workerName,
    };

    if (action === 'pause') {
      data.reason = reason;
      data.note = note;
      
      if (reason === 'depends-previous-station') {
        data.dependsOnStation = dependsOnStation;
      }
    }

    await onConfirm(data);
    setLoading(false);
    handleClose();
  };

  const handleClose = () => {
    setWorkerNumber('');
    setWorkerName('');
    setReason('missing-parts');
    setNote('');
    setDependsOnStation('');
    setEmployeeStatus(null);
    onClose();
  };

  const getTitle = () => {
    switch (action) {
      case 'start': return 'Start Gig';
      case 'complete': return 'Complete Gig';
      case 'pause': return 'Pause Gig';
      default: return '';
    }
  };

  const getButtonText = () => {
    if (loading) return 'Processing...';
    switch (action) {
      case 'start': return 'Start Gig';
      case 'complete': return 'Complete Gig';
      case 'pause': return 'Pause Gig';
      default: return '';
    }
  };

  const getButtonColor = () => {
    switch (action) {
      case 'start': return 'bg-orange-500 hover:bg-orange-600';
      case 'complete': return 'bg-green-600 hover:bg-green-700';
      case 'pause': return 'bg-blue-600 hover:bg-blue-700';
      default: return 'bg-blue-600 hover:bg-blue-700';
    }
  };

  const availableStations = STATIONS.filter(station => station !== gigInfo?.station);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-sm max-w-md w-full">
        <div className="border-b border-slate-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="font-heading font-bold text-xl text-slate-900">
              {getTitle()}
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Truck Number: {gigInfo?.truckNumber} - {gigInfo?.station}
            </p>
          </div>
          <button onClick={handleClose} className="p-2 hover:bg-slate-100 rounded transition-colors">
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Employee Number con autocompletado */}
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
              Employee Number *
            </label>
            <div className="relative">
              <input
                type="text"
                className={`input-field pr-10 ${
                  employeeStatus === 'found' ? 'border-green-500 bg-green-50' : 
                  employeeStatus === 'not-found' ? 'border-red-500 bg-red-50' : ''
                }`}
                placeholder="e.g., 12345"
                value={workerNumber}
                onChange={(e) => setWorkerNumber(e.target.value)}
                required
                autoFocus
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {employeeLoading && <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />}
                {!employeeLoading && employeeStatus === 'found' && <CheckCircle className="w-5 h-5 text-green-500" />}
                {!employeeLoading && employeeStatus === 'not-found' && <XCircle className="w-5 h-5 text-red-500" />}
              </div>
            </div>
            {employeeStatus === 'not-found' && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                Employee Number not found. Contact your Lead.
              </p>
            )}
            {employeeStatus === 'found' && (
              <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Employee verified ✓
              </p>
            )}
          </div>

          {/* Employee Name - Autocompletado */}
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
              Employee Name *
            </label>
            <input
              type="text"
              className={`input-field ${employeeStatus === 'found' ? 'bg-green-50' : ''}`}
              placeholder="Full name"
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
              required
              readOnly={employeeStatus === 'found'}
            />
            {/* {employeeStatus === 'found' && (
              <p className="text-xs text-slate-500 mt-1">✓ Auto-filled from database</p>
            )} */}
          </div>

          {action === 'pause' && (
            <>
              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
                  Reason for the pause *
                </label>
                <select
                  className="input-field"
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setDependsOnStation('');
                    setNote('');
                  }}
                  required
                >
                  <option value="missing-parts">Missing Part (Notify Admin)</option>
                  <option value="depends-previous-station">It depends on another station's task</option>
                  <option value="other">Another Reason</option>
                </select>
              </div>

              {/* Selector de estación cuando depende de otra */}
              {reason === 'depends-previous-station' && (
                <div>
                  <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
                    Select the station this task depends on *
                  </label>
                  <select
                    className="input-field"
                    value={dependsOnStation}
                    onChange={(e) => setDependsOnStation(e.target.value)}
                    required
                  >
                    <option value="">-- Select Station --</option>
                    {availableStations.map(station => (
                      <option key={station} value={station}>{station}</option>
                    ))}
                  </select>
                  <p className="text-xs text-blue-600 mt-1">
                    ℹ️ The Lead of "{dependsOnStation || 'selected station'}" will be notified
                  </p>
                </div>
              )}

              {/* Nota/Descripción */}
              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
                  {reason === 'missing-parts' ? 'Missing Part Description *' : 'Note / Details'}
                </label>
                <textarea
                  className="input-field min-h-[80px] resize-none"
                  placeholder={reason === 'missing-parts' ? 'Describe the missing part...' : 'Describe the problem...'}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  required={reason === 'missing-parts'}
                />
              </div>

              {/* Info about notification */}
              {reason === 'missing-parts' && (
                <p className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                  ⚠️ Admin will be notified and this will be added to the Missing Parts list for Truck #{gigInfo?.truckNumber}
                </p>
              )}
            </>
          )}

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className={`flex-1 text-white font-bold uppercase text-sm py-3 px-4 rounded-sm transition-colors ${getButtonColor()}`}
              disabled={loading || employeeStatus === 'not-found'}
            >
              {getButtonText()}
            </button>
            <button
              type="button"
              onClick={handleClose}
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

import { useState } from 'react';
import { X } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      workerNumber,
      workerName,
    };

    if (action === 'block') {
      data.reason = reason;
      data.note = note;
    }

    await onConfirm(data);
    setLoading(false);
    onClose();
  };

  const getTitle = () => {
    switch (action) {
      case 'start':
        return 'Start Gig';
      case 'complete':
        return 'Complete Gig';
      case 'block':
        return 'Block Gig';
      default:
        return '';
    }
  };

  const getButtonText = () => {
    if (loading) return 'Processing...';
    switch (action) {
      case 'start':
        return 'Start Gig';
      case 'complete':
        return 'Complete Gig';
      case 'block':
        return 'Block Gig';
      default:
        return '';
    }
  };

  const getButtonColor = () => {
    switch (action) {
      case 'start':
        return 'bg-orange-500 hover:bg-orange-600';
      case 'complete':
        return 'bg-green-600 hover:bg-green-700';
      case 'block':
        return 'bg-red-600 hover:bg-red-700';
      default:
        return 'bg-blue-600 hover:bg-blue-700';
    }
  };

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
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded transition-colors">
            <X size={20} className="text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
              Employee number *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Ej: TRB-001"
              value={workerNumber}
              onChange={(e) => setWorkerNumber(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div>
            <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
              Employee name *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="Full name"
              value={workerName}
              onChange={(e) => setWorkerName(e.target.value)}
              required
            />
          </div>

          {action === 'block' && (
            <>
              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
                  Reason for the blockage *
                </label>
                <select
                  className="input-field"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                >
                  <option value="missing-parts">Missing Part.</option>
                  <option value="depends-previous-station">It depends on the task of the previous station.</option>
                  <option value="other">Another Reason</option>
                </select>
              </div>

              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
                  Note / Details
                </label>
                <textarea
                  className="input-field min-h-[80px] resize-none"
                  placeholder="Describe the problem..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              className={`flex-1 text-white font-bold uppercase text-sm py-3 px-4 rounded-sm transition-colors ${getButtonColor()}`}
              disabled={loading}
            >
              {getButtonText()}
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
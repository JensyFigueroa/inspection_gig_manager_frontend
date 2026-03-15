import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authAxios } from '../App';
import Sidebar from '../components/Sidebar';
import { toast } from 'sonner';
import { ArrowLeft, Package, CheckCircle, Clock, Truck, AlertTriangle, Save, X, Edit2 } from 'lucide-react';

export default function MissingPartsList({ user }) {
  const { truckNumber } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingPart, setEditingPart] = useState(null);
  const [editForm, setEditForm] = useState({ partNumber: '', status: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (truckNumber) {
      loadMissingParts();
    }
  }, [truckNumber]);

  const loadMissingParts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading missing parts for truck:', truckNumber);
      const response = await authAxios.get(`/gigs/missing-parts/${truckNumber}`);
      console.log('Response:', response.data);
      setData(response.data);
    } catch (error) {
      console.error('Error loading missing parts:', error);
      setError(error.response?.data?.error || 'Error loading missing parts');
      toast.error('Error loading missing parts');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (part) => {
    setEditingPart(part._id);
    setEditForm({
      partNumber: part.partNumber || '',
      status: part.status || 'pending'
    });
  };

  const handleCancelEdit = () => {
    setEditingPart(null);
    setEditForm({ partNumber: '', status: '' });
  };

  const handleSaveEdit = async (part) => {
    try {
      await authAxios.put(`/gigs/missing-parts/${part.sourceId}/${part._id}`, {
        partNumber: editForm.partNumber,
        status: editForm.status
      });
      toast.success('Part updated successfully');
      setEditingPart(null);
      loadMissingParts();
    } catch (error) {
      console.error('Error updating part:', error);
      toast.error(error.response?.data?.error || 'Error updating part');
    }
  };

  const handleQuickStatusUpdate = async (part, newStatus) => {
    try {
      await authAxios.put(`/gigs/missing-parts/${part.sourceId}/${part._id}`, {
        status: newStatus
      });
      toast.success(`Status updated to ${newStatus}`);
      loadMissingParts();
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      ordered: 'bg-blue-100 text-blue-800 border-blue-300',
      received: 'bg-green-100 text-green-800 border-green-300'
    };
    return styles[status] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'ordered': return <Package className="w-4 h-4" />;
      case 'received': return <CheckCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  // Solo admin y QC pueden ver esta página
  if (user.role !== 'admin' && user.role !== 'qc') {
    return (
      <div className="flex">
        <Sidebar user={user} />
        <div className="flex-1 ml-64 p-8 lg:p-12 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">You don't have permission to view this page.</p>
          </div>
        </div>
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
            onClick={() => navigate('/notifications')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Notifications
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Truck className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h1 className="font-heading font-black text-3xl uppercase tracking-tight text-slate-900">
                Missing Parts List
              </h1>
              <p className="text-slate-600">Truck #{truckNumber}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64">
            <AlertTriangle className="w-16 h-16 text-red-400 mb-4" />
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <button
              onClick={loadMissingParts}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
                <p className="text-sm text-slate-500">Total Parts</p>
                <p className="text-3xl font-bold text-slate-900">{data?.totalParts || 0}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-6 shadow-sm border border-yellow-200">
                <p className="text-sm text-yellow-700">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {data?.parts?.filter(p => p.status === 'pending').length || 0}
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-6 shadow-sm border border-blue-200">
                <p className="text-sm text-blue-700">Ordered</p>
                <p className="text-3xl font-bold text-blue-600">
                  {data?.parts?.filter(p => p.status === 'ordered').length || 0}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-6 shadow-sm border border-green-200">
                <p className="text-sm text-green-700">Received</p>
                <p className="text-3xl font-bold text-green-600">
                  {data?.parts?.filter(p => p.status === 'received').length || 0}
                </p>
              </div>
            </div>

            {/* Parts Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200">
              <div className="p-6 border-b border-slate-200 bg-slate-50">
                <h2 className="font-semibold text-lg text-slate-900">Parts Details</h2>
                <p className="text-sm text-slate-500 mt-1">Click the edit button to modify Part # or Status</p>
              </div>

              {!data?.parts?.length ? (
                <div className="p-12 text-center">
                  <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg">No missing parts reported for this truck</p>
                  <p className="text-slate-400 text-sm mt-2">Missing parts will appear here when reported</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="text-left p-4 font-semibold text-slate-700 border-b border-slate-200">#</th>
                        <th className="text-left p-4 font-semibold text-slate-700 border-b border-slate-200">Part #</th>
                        <th className="text-left p-4 font-semibold text-slate-700 border-b border-slate-200">Description Part</th>
                        <th className="text-left p-4 font-semibold text-slate-700 border-b border-slate-200">Station</th>
                        <th className="text-left p-4 font-semibold text-slate-700 border-b border-slate-200">Status</th>
                        <th className="text-center p-4 font-semibold text-slate-700 border-b border-slate-200">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.parts.map((part, index) => (
                        <tr key={part._id || index} className="hover:bg-slate-50 transition-colors">
                          {/* Row Number */}
                          <td className="p-4 text-slate-500 font-medium">
                            {index + 1}
                          </td>

                          {/* Part Number - Editable */}
                          <td className="p-4">
                            {editingPart === part._id ? (
                              <input
                                type="text"
                                value={editForm.partNumber}
                                onChange={(e) => setEditForm({ ...editForm, partNumber: e.target.value })}
                                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Enter Part #"
                              />
                            ) : (
                              <span className={`font-mono text-sm ${part.partNumber ? 'text-slate-900 font-semibold' : 'text-slate-400 italic'}`}>
                                {part.partNumber || 'Not assigned'}
                              </span>
                            )}
                          </td>

                          {/* Description */}
                          <td className="p-4">
                            <p className="font-medium text-slate-900">{part.partName}</p>
                            {part.notes && (
                              <p className="text-xs text-slate-500 mt-1">{part.notes}</p>
                            )}
                            <p className="text-xs text-slate-400 mt-1">
                              Added: {new Date(part.addedAt).toLocaleDateString()} by {part.addedBy?.workerName || 'Unknown'}
                            </p>
                          </td>

                          {/* Station */}
                          <td className="p-4">
                            <span className="text-sm bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                              {part.station}
                            </span>
                          </td>

                          {/* Status - Editable */}
                          <td className="p-4">
                            {editingPart === part._id ? (
                              <select
                                value={editForm.status}
                                onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                                className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                              >
                                <option value="pending">Pending</option>
                                <option value="ordered">Ordered</option>
                                <option value="received">Received</option>
                              </select>
                            ) : (
                              <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusBadge(part.status)}`}>
                                {getStatusIcon(part.status)}
                                {part.status.charAt(0).toUpperCase() + part.status.slice(1)}
                              </span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="p-4">
                            <div className="flex justify-center gap-2">
                              {editingPart === part._id ? (
                                <>
                                  <button
                                    onClick={() => handleSaveEdit(part)}
                                    className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                                    title="Save"
                                  >
                                    <Save className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                                    title="Cancel"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleStartEdit(part)}
                                    className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  
                                  {/* Quick status buttons */}
                                  {part.status === 'pending' && (
                                    <button
                                      onClick={() => handleQuickStatusUpdate(part, 'ordered')}
                                      className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                      Mark Ordered
                                    </button>
                                  )}
                                  {part.status === 'ordered' && (
                                    <button
                                      onClick={() => handleQuickStatusUpdate(part, 'received')}
                                      className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                      Mark Received
                                    </button>
                                  )}
                                  {part.status === 'received' && (
                                    <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                                      <CheckCircle className="w-4 h-4" />
                                      Complete
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="mt-6 bg-white rounded-lg p-4 shadow-sm border border-slate-200">
              <h3 className="font-medium text-slate-700 mb-3">Status Legend</h3>
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border ${getStatusBadge('pending')}`}>
                    <Clock className="w-4 h-4" /> Pending
                  </span>
                  <span className="text-sm text-slate-500">- Part has been requested</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border ${getStatusBadge('ordered')}`}>
                    <Package className="w-4 h-4" /> Ordered
                  </span>
                  <span className="text-sm text-slate-500">- Part has been ordered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm border ${getStatusBadge('received')}`}>
                    <CheckCircle className="w-4 h-4" /> Received
                  </span>
                  <span className="text-sm text-slate-500">- Part has been received</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authAxios } from '../App';
import Sidebar from '../components/Sidebar';
import { toast } from 'sonner';
import { ArrowLeft, Package, CheckCircle, Clock, Truck, AlertTriangle } from 'lucide-react';

export default function MissingPartsList({ user }) {
  const { truckNumber } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMissingParts();
  }, [truckNumber]);

  const loadMissingParts = async () => {
    try {
      setLoading(true);
      const response = await authAxios.get(`/gigs/missing-parts/${truckNumber}`);
      setData(response.data);
    } catch (error) {
      toast.error('Error loading missing parts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (gigId, partId, newStatus) => {
    try {
      await authAxios.put(`/gigs/missing-parts/${gigId}/${partId}`, { status: newStatus });
      toast.success(`Part marked as ${newStatus}`);
      loadMissingParts();
    } catch (error) {
      toast.error('Error updating part status');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      ordered: 'bg-blue-100 text-blue-800',
      received: 'bg-green-100 text-green-800'
    };
    return styles[status] || 'bg-gray-100 text-gray-800';
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
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Truck className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h1 className="font-heading font-black text-3xl uppercase tracking-tight text-slate-900">
                Missing Parts
              </h1>
              <p className="text-slate-600">Truck #{truckNumber}</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-[#FF5722] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <p className="text-sm text-slate-500">Total Parts</p>
                <p className="text-3xl font-bold text-slate-900">{data?.totalParts || 0}</p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <p className="text-sm text-slate-500">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {data?.parts?.filter(p => p.status === 'pending').length || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <p className="text-sm text-slate-500">Ordered</p>
                <p className="text-3xl font-bold text-blue-600">
                  {data?.parts?.filter(p => p.status === 'ordered').length || 0}
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <p className="text-sm text-slate-500">Received</p>
                <p className="text-3xl font-bold text-green-600">
                  {data?.parts?.filter(p => p.status === 'received').length || 0}
                </p>
              </div>
            </div>

            {/* Parts List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h2 className="font-semibold text-lg text-slate-900">Parts List</h2>
              </div>

              {!data?.parts?.length ? (
                <div className="p-12 text-center">
                  <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No missing parts reported for this truck</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="text-left p-4 font-semibold text-slate-600">Part Description</th>
                        <th className="text-left p-4 font-semibold text-slate-600">Station</th>
                        <th className="text-left p-4 font-semibold text-slate-600">Reported By</th>
                        <th className="text-left p-4 font-semibold text-slate-600">Date</th>
                        <th className="text-left p-4 font-semibold text-slate-600">Status</th>
                        <th className="text-center p-4 font-semibold text-slate-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.parts.map((part, index) => (
                        <tr key={index} className="hover:bg-slate-50">
                          <td className="p-4">
                            <p className="font-medium text-slate-900">{part.partName}</p>
                            {part.partNumber && (
                              <p className="text-sm text-slate-500">Part #: {part.partNumber}</p>
                            )}
                            {part.notes && (
                              <p className="text-sm text-slate-400 mt-1">{part.notes}</p>
                            )}
                          </td>
                          <td className="p-4">
                            <span className="text-sm bg-slate-100 text-slate-700 px-2 py-1 rounded">
                              {part.station}
                            </span>
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-slate-900">{part.addedBy?.workerName}</p>
                            <p className="text-xs text-slate-500">#{part.addedBy?.workerNumber}</p>
                          </td>
                          <td className="p-4">
                            <p className="text-sm text-slate-600">
                              {new Date(part.addedAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-slate-400">
                              {new Date(part.addedAt).toLocaleTimeString()}
                            </p>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(part.status)}`}>
                              {getStatusIcon(part.status)}
                              {part.status.charAt(0).toUpperCase() + part.status.slice(1)}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex justify-center gap-2">
                              {part.status === 'pending' && (
                                <button
                                  onClick={() => handleUpdateStatus(part.sourceId, part._id, 'ordered')}
                                  className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded hover:bg-blue-200 transition-colors"
                                >
                                  Mark Ordered
                                </button>
                              )}
                              {part.status === 'ordered' && (
                                <button
                                  onClick={() => handleUpdateStatus(part.sourceId, part._id, 'received')}
                                  className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded hover:bg-green-200 transition-colors"
                                >
                                  Mark Received
                                </button>
                              )}
                              {part.status === 'received' && (
                                <span className="text-xs text-green-600 font-medium">✓ Complete</span>
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
          </>
        )}
      </div>
    </div>
  );
}

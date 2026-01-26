import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAxios } from '../App';
import { toast } from 'sonner';
import Sidebar from '../components/Sidebar';
import CreateGigModal from '../components/CreateGigModal';
import WorkerActionModal from '../components/WorkerActionModal';
import { Pencil, Trash2, Plus, Image as ImageIcon, Play, CheckCircle, Ban } from 'lucide-react';

export default function Dashboard({ user }) {
  const [gigs, setGigs] = useState([]);
  const [users, setUsers] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGig, setEditingGig] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterStation, setFilterStation] = useState('');
  const [filterTruck, setFilterTruck] = useState('');
  const [photoPreview, setPhotoPreview] = useState(null);
  
  // Worker Action Modal
  const [workerActionModal, setWorkerActionModal] = useState({
    isOpen: false,
    action: null,
    gigId: null,
    gigInfo: null
  });

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [gigsRes, usersRes, operatorsRes] = await Promise.all([
        authAxios.get('/gigs'),
        authAxios.get('/users'),
        authAxios.get('/operators'),
      ]);
      setGigs(gigsRes.data);
      setUsers(usersRes.data);
      setOperators(operatorsRes.data);
    } catch (error) {
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };


  const handleOperatorChange = async (gigId, employeeNumber) => {
    console.log(employeeNumber)
  try {
    await authAxios.put(`/gigs/${gigId}`, {
      employeeNumber
    });

    // Update local state (without reloading the entire page)
    setGigs(prev =>
      prev.map(gig =>
        gig._id === gigId
          ? { ...gig, employeeNumber }
          : gig
      )
    );

    toast.success('Operator assigned');
  } catch (error) {
    toast.error('Error assigning operator');
  }
};

  const handleDelete = async (gigId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this gig?')) return;

    try {
      await authAxios.delete(`/gigs/${gigId}`);
      setGigs(gigs.filter(g => g._id !== gigId));
      toast.success('Gig deleted');
    } catch (error) {
      toast.error('Error deleting gig');
    }
  };

  const handleEdit = (gig, e) => {
    e.stopPropagation();
    setEditingGig(gig);
    setShowModal(true);
  };

  const openWorkerActionModal = (action, gig, e) => {
    e.stopPropagation();
    setWorkerActionModal({
      isOpen: true,
      action,
      gigId: gig._id,
      gigInfo: {
        truckNumber: gig.truckNumber,
        station: gig.station
      }
    });
  };

  const handleWorkerAction = async (data) => {
    try {
      const { action, gigId } = workerActionModal;
      
      if (action === 'start') {
        await authAxios.post(`/gigs/${gigId}/start`, data);
        toast.success('Gig iniciado');
      } else if (action === 'complete') {
        await authAxios.post(`/gigs/${gigId}/complete`, data);
        toast.success('Gig completado');
      } else if (action === 'block') {
        await authAxios.post(`/gigs/${gigId}/block`, data);
        toast.success('Gig bloqueado');
      }

      loadData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error processing action');
    }
  };

  const getUserName = (id) => {
    const user = users.find(i => i._id === id);
    return user ? user.fullName : 'Unknown';
  };

  const filteredGigs = gigs.filter(gig => {
    const statusMatch = filterStatus === 'all' || gig.status === filterStatus;
    const stationMatch = !filterStation || gig.station.toLowerCase().includes(filterStation.toLowerCase());
    const truckMatch = !filterTruck || (gig.truckNumber && gig.truckNumber.toLowerCase().includes(filterTruck.toLowerCase()));
    return statusMatch && stationMatch && truckMatch;
  });

  const handlePhotoClick = (photoUrl, e) => {
    e.stopPropagation();

    setPhotoPreview(photoUrl);
  };
  
 

  const getStatusBadgeClass = (status) => {
    const classes = {
      'pending': 'status-pending',
      'in-progress': 'status-in-progress',
      'completed': 'status-completed',
      'blocked': 'bg-red-100 text-red-800 border-red-300'
    };
    return `status-badge ${classes[status] || ''}`;
  };

  const getStatusText = (status) => {
    const texts = {
      'pending': 'Pending',
      'in-progress': 'In Progress',
      'completed': 'Completed',
      'blocked': 'Blocked'
    };
    return texts[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-[#FF5722] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar user={user} />
    
      <div className="flex-1 ml-64 p-8 lg:p-12 bg-gray-50 min-h-screen">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-heading font-black text-4xl uppercase tracking-tight text-slate-900 mb-2">
              Gigs
            </h1>
            <p className="font-body text-slate-600">
              {user.role === 'qc' && 'Manage all production gigs'}
              {user.role === 'lead' && `Station: ${user.station}`}
              {user.role === 'worker' && `Station: ${user.station}`}
            </p>
          </div>
          
          {/* Only QC can be create gigs */}
          {user.role === 'qc' && (
            <button
              onClick={() => {
                setEditingGig(null);
                setShowModal(true);
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              New Gig
            </button>
          )}
        </div>

        <div className="mb-6 flex flex-wrap gap-4 items-end">
          <div className="flex gap-2">
            {['all', 'pending', 'in-progress', 'completed', 'blocked'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 font-mono text-xs uppercase tracking-wider rounded-sm transition-all ${
                  filterStatus === status
                    ? 'bg-[#FF5722] text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {status === 'all' ? 'All' : 
                 status === 'pending' ? 'Pending' : 
                 status === 'in-progress' ? 'In Progress' : 
                 status === 'completed' ? 'Completed' : 'Blocked'}
              </button>
            ))}
          </div>
          
          {user.role === 'qc' && (
            <div className="flex-1 max-w-xs">
              <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
                Filter by Station
              </label>
              <input
                type="text"
                placeholder="Find station..."
                className="input-field"
                value={filterStation}
                onChange={(e) => setFilterStation(e.target.value)}
              />
            </div>
          )}

          <div className="flex-1 max-w-xs">
            <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
              Filter by Truck
            </label>
            <input
              type="text"
              placeholder="Find truck..."
              className="input-field"
              value={filterTruck}
              onChange={(e) => setFilterTruck(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-header text-left">Truck #</th>                
                <th className="table-header text-left">Station</th>
                <th className="table-header text-left">Description</th>
                <th className="table-header text-left">Photo</th>
                <th className="table-header text-left">Status</th>
                <th className="table-header text-left">Operator</th>
                <th className="table-header text-left">Inspector</th>
                <th className="table-header text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGigs.map((gig, index) => (
                <tr
                  key={gig._id}
                  className="table-row fade-in-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                  // onClick={() => navigate(`/gig/${gig._id}`)}
                >
                  <td className="p-4 font-mono text-sm font-bold text-slate-900" onClick={() => navigate(`/gig/${gig._id}`)}>{gig.truckNumber}</td>                  
                  <td className="p-4 font-mono text-sm font-medium text-slate-900" onClick={() => navigate(`/gig/${gig._id}`)}>{gig.station}</td>
                  <td className="p-4 font-body text-sm text-slate-600" onClick={() => navigate(`/gig/${gig._id}`)}>
                    {gig.description.length > 40 ? `${gig.description.substring(0, 40)}...` : gig.description}
                  </td>
                  <td className="p-4" onClick={(e) => e.stopPropagation()}>
                    {gig.photos && gig.photos.length > 0 ? (
                      <button
                        onClick={(e) => handlePhotoClick(gig.photos[0], e)}
                        className="w-12 h-12 rounded-sm overflow-hidden border border-slate-200 hover:border-[#FF5722] transition-colors"
                      >
                        <img 
                          src={gig.photos[0]} 
                          alt="Thumbnail" 
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ) : (
                      <div className="w-12 h-12 rounded-sm bg-slate-100 flex items-center justify-center border border-slate-200">
                        <ImageIcon size={20} className="text-slate-400" />
                      </div>
                    )}
                  </td>
                  <td className="p-4" onClick={() => navigate(`/gig/${gig._id}`)}>
                    <span className={getStatusBadgeClass(gig.status)}>
                      {getStatusText(gig.status)}
                    </span>
                  </td>
                  <td className="p-4" onClick={user.role === 'qc' ? () => navigate(`/gig/${gig._id}`) : null}>
                    {user.role === 'lead' ? (
              
                      <select className="input-field" value={gig.employeeNumber || ''} onChange={(e) => handleOperatorChange(gig._id, e.target.value)}>
                          {operators.map(operator => (
                            <option key={operator.employeeNumber} value={operator.employeeNumber}>
                              {operator.fullName}
                            </option>
                            ))}
                          </select>

            
                ) :  <span className="font-body text-sm text-slate-600"   >
                      {operators.map(operator => operator.employeeNumber === gig.employeeNumber && operator.fullName)}
                    </span>}
                  
                    
                          
                  </td>
                  <td className="p-4 font-body text-sm text-slate-600" onClick={() => navigate(`/gig/${gig._id}`)}>
                    {getUserName(gig.inspectorId)}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2 flex-wrap">
                      {/* Buttons for Worker and Lead */}
                      {(user.role === 'worker' || user.role === 'lead') && (
                        <>
                          {gig.status === 'pending' && (
                            <button
                              onClick={(e) => openWorkerActionModal('start', gig, e)}
                              className="px-3 py-1 bg-orange-500 text-white text-xs font-bold uppercase rounded-sm hover:bg-orange-600 transition-colors flex items-center gap-1"
                              title="Start"
                            >
                              <Play size={14} />
                              Start
                            </button>
                          )}
                          {gig.status === 'in-progress' && (
                            <>
                              <button
                                onClick={(e) => openWorkerActionModal('complete', gig, e)}
                                className="px-3 py-1 bg-green-600 text-white text-xs font-bold uppercase rounded-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                                title="Complete"
                              >
                                <CheckCircle size={14} />
                                Complete
                              </button>
                              <button
                                onClick={(e) => openWorkerActionModal('block', gig, e)}
                                className="px-3 py-1 bg-red-600 text-white text-xs font-bold uppercase rounded-sm hover:bg-red-700 transition-colors flex items-center gap-1"
                                title="Bloquear"
                              >
                                <Ban size={14} />
                                Block
                              </button>
                            </>
                          )}
                          {gig.status === 'blocked' && (
                            <button
                              onClick={(e) => openWorkerActionModal('start', gig, e)}
                              className="px-3 py-1 bg-blue-600 text-white text-xs font-bold uppercase rounded-sm hover:bg-blue-700 transition-colors flex items-center gap-1"
                              title="Reiniciar"
                            >
                              <Play size={14} />
                              Restart
                            </button>
                          )}
                        </>
                      )}

                      {/* Buttons for QC only */}
                      {user.role === 'qc' && (
                        <>
                          <button
                            onClick={(e) => handleEdit(gig, e)}
                            className="p-2 hover:bg-slate-100 rounded transition-colors"
                            title="Edit"
                          >
                            <Pencil size={16} className="text-slate-600" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(gig._id, e)}
                            className="p-2 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredGigs.length === 0 && (
            <div className="p-12 text-center">
              <p className="font-body text-slate-500">There are no gigs available</p>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Gig Modal (QC Only) */}
      {user.role === 'qc' && showModal && (
        <CreateGigModal user={user}
          onClose={() => {
            setShowModal(false);
            setEditingGig(null);
          }}
          onSuccess={() => {
            loadData();
            setShowModal(false);
            setEditingGig(null);
          }}
          users={users}
          editingGig={editingGig}
        />
      )}

      {/* Modal de Acciones de Worker */}
      <WorkerActionModal
        isOpen={workerActionModal.isOpen}
        onClose={() => setWorkerActionModal({ ...workerActionModal, isOpen: false })}
        onConfirm={handleWorkerAction}
        action={workerActionModal.action}
        gigInfo={workerActionModal.gigInfo}
      />

      {/* Preview de Photo */}
      {photoPreview && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setPhotoPreview(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setPhotoPreview(null)}
              className="absolute -top-12 right-0 p-2 bg-white rounded-sm hover:bg-slate-100 transition-colors"
            >
              X 
            </button>
            
            <img
              src={photoPreview}
              alt="Preview"
              className="max-w-full max-h-[90vh] rounded-sm"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}
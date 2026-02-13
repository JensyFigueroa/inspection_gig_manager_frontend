import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authAxios } from '../App';
import { toast } from 'sonner';
import Sidebar from '../components/Sidebar';
import PhotoUploader from '../components/PhotoUploader';
import WorkerActionModal from '../components/WorkerActionModal';
import { ArrowLeft, Image as ImageIcon, X, User, Clock, AlertCircle, Play, CheckCircle, Ban } from 'lucide-react';

export default function GigDetail({user}) {
  const { gigId } = useParams();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [inspectorRes, setInspectorRes] = useState([]);
  const [operatorRes, setOperatorRes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPhotoUploader, setShowPhotoUploader] = useState(false);
  
  const [workerActionModal, setWorkerActionModal] = useState({
    isOpen: false,
    action: null,
    gigInfo: null
  });

  useEffect(() => {
    loadGigData();
  }, [gigId]);

  const loadGigData = async () => {
    try {
      const [gigRes, commentsRes] = await Promise.all([
        authAxios.get(`/gigs/${gigId}`),
        authAxios.get(`/gigs/${gigId}/comments`),
        authAxios.get('/users'),
        authAxios.get('/operators'),
      ]);
      
      setGig(gigRes.data);
      setComments(commentsRes.data);

      if (gigRes.data.inspectorId) {
        const inspector = await authAxios.get(`/users/${gigRes.data.inspectorId}`);
        setInspectorRes(inspector.data);
      }

      if (gigRes.data.employeeNumber) {
        const operatorRes = await authAxios.get(`/operators/${gigRes.data.employeeNumber}`);
        setOperatorRes(operatorRes.data);
      }
    } catch (error) {
      toast.error('Error loading gig data');
    } finally {
      setLoading(false);
    }
  };


  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await authAxios.post(`/gigs/${gigId}/comments`, {
        text: newComment
      });
      setComments([...comments, response.data]);
      setNewComment('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Error adding comment');
    }
  };

  const handleAddPhoto = async (newPhotos) => {
    try {
      await authAxios.put(`/gigs/${gigId}`, { photos: newPhotos });
      setGig({ ...gig, photos: newPhotos });
      setShowPhotoUploader(false);
      toast.success('Photos updated');
      loadGigData();
    } catch (error) {
      toast.error('Error updating photos');
    }
  };

  const handleRemovePhoto = async (photoUrl) => {
    try {
      const updatedPhotos = gig.photos.filter(p => p !== photoUrl);
      await authAxios.put(`/gigs/${gigId}`, { photos: updatedPhotos });
      setGig({ ...gig, photos: updatedPhotos });
      toast.success('Photo removed');
    } catch (error) {
      toast.error('Error removing photo');
    }
  };

  const openWorkerActionModal = (action) => {
    setWorkerActionModal({
      isOpen: true,
      action,
      gigInfo: {
        truckNumber: gig.truckNumber,
        station: gig.station
      }
    });
  };

  const handleWorkerAction = async (data) => {
    try {
      const { action } = workerActionModal;
      
      if (action === 'start') {
        await authAxios.post(`/gigs/${gigId}/start`, data);
        toast.success('Gig started');
      } else if (action === 'complete') {
        await authAxios.post(`/gigs/${gigId}/complete`, data);
        toast.success('Gig completed');
      } else if (action === 'block') {
        await authAxios.post(`/gigs/${gigId}/block`, data);
        toast.success('Gig blocked');
      }

      loadGigData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error processing action');
    }
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

  const getBlockedReasonText = (reason) => {
    const texts = {
      'missing-parts': 'Missing Parts',
      'depends-previous-station': 'Depends on Previous Station',
      'other': 'Other Reason'
    };
    return texts[reason] || reason;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-[#FF5722] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!gig) return null;

  return (
    <div className="flex">
      <Sidebar user={user} />
      
      <div className="flex-1 ml-64 p-8 lg:p-12 bg-gray-50 min-h-screen">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 font-body text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Información Principal */}
            <div className="card">
              <div className="mb-6 flex justify-between items-start">
                <div>
                  <h1 className="font-heading font-bold text-3xl text-slate-900 mb-2">
                    Truck # {gig.truckNumber}
                  </h1>
                  <p className="font-mono text-sm text-slate-600 mb-3">
                    Station: <span className="font-bold">{gig.station}</span>
                  </p>
                  <span className={getStatusBadgeClass(gig.status)}>
                    {getStatusText(gig.status)}
                  </span>
                </div>

                {/* Action Buttons for Worker/Lead */}
                {(user.role === 'worker' || user.role === 'lead') && (
                  <div className="flex gap-2">
                    {/* {gig.status === 'pending' && (
                      <button
                        onClick={() => openWorkerActionModal('start')}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Play size={18} />
                        Start
                      </button>
                    )} */}
                    {gig.status === 'in-progress' && (
                      <>
                        <button
                          onClick={() => openWorkerActionModal('complete')}
                          className="bg-green-600 hover:bg-green-700 text-white font-bold uppercase text-sm py-2 px-4 rounded-sm transition-colors flex items-center gap-2"
                        >
                          <CheckCircle size={18} />
                          Complete
                        </button>
                        <button
                          onClick={() => openWorkerActionModal('block')}
                          className="bg-red-600 hover:bg-red-700 text-white font-bold uppercase text-sm py-2 px-4 rounded-sm transition-colors flex items-center gap-2"
                        >
                          <Ban size={18} />
                          Block
                        </button>
                      </>
                    )}
                    {gig.status === 'blocked' && (
                      <button
                        onClick={() => openWorkerActionModal('start')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold uppercase text-sm py-2 px-4 rounded-sm transition-colors flex items-center gap-2"
                      >
                        <Play size={18} />
                        Restart
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-1">
                    Description
                  </label>
                  <p className="font-body text-slate-900">{gig.description}</p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-1">
                      Operator
                    </label>
                    <p className="font-body text-slate-900">{operatorRes ? operatorRes.fullName : 'Unassigned'}</p>
                  </div>

                  <div>
                    <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-1">
                      Inspection Date 
                    </label>
                    <p className="font-mono text-sm text-slate-900">
                      {gig.createdAt ? new Date(gig.createdAt).toLocaleDateString('en-US'): '-'}
                    </p>
                  </div>

                   <div>
                    <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-1">
                      Inspector 
                    </label>
                    <p className="font-mono text-sm text-slate-900">
                      {inspectorRes.fullName}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gig History */}
            {(gig.startedBy || gig.completedBy) && (
              <div className="card">
                <h2 className="font-heading font-bold text-xl text-slate-900 mb-4">Gig History</h2>
                
                {gig.startedBy && (
                  <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <User size={18} className="text-orange-600" />
                      <span className="font-mono text-xs uppercase tracking-wider text-orange-800 font-bold">
                        Started by
                      </span>
                    </div>
                    <p className="font-body text-sm text-slate-900">
                      <span className="font-bold">{gig.startedBy.workerName}</span>
                      <span className="text-slate-600"> (#{gig.startedBy.workerNumber})</span>
                    </p>
                    <p className="font-mono text-xs text-slate-600 mt-1 flex items-center gap-1">
                      <Clock size={14} />
                      {new Date(gig.startedBy.startedAt).toLocaleString('es-ES')}
                    </p>
                  </div>
                )}

                {gig.completedBy && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle size={18} className="text-green-600" />
                      <span className="font-mono text-xs uppercase tracking-wider text-green-800 font-bold">
                        Completed by
                      </span>
                    </div>
                    <p className="font-body text-sm text-slate-900">
                      <span className="font-bold">{gig.completedBy.workerName}</span>
                      <span className="text-slate-600"> (#{gig.completedBy.workerNumber})</span>
                    </p>
                    <p className="font-mono text-xs text-slate-600 mt-1 flex items-center gap-1">
                      <Clock size={14} />
                      {new Date(gig.completedBy.completedAt).toLocaleString('es-ES')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* information blockade */}
            {gig.status === 'blocked' && gig.blockedInfo && (
              <div className="card bg-red-50 border-red-200">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle size={24} className="text-red-600" />
                  <h2 className="font-heading font-bold text-xl text-red-900">Gig Blocked</h2>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="font-mono text-xs uppercase tracking-wider text-red-700 block mb-1">
                      Reason
                    </label>
                    <p className="font-body font-bold text-red-900">
                      {getBlockedReasonText(gig.blockedInfo.reason)}
                    </p>
                  </div>

                  {gig.blockedInfo.note && (
                    <div>
                      <label className="font-mono text-xs uppercase tracking-wider text-red-700 block mb-1">
                        Note
                      </label>
                      <p className="font-body text-red-900">
                        {gig.blockedInfo.note}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="font-mono text-xs uppercase tracking-wider text-red-700 block mb-1">
                      Blocked by
                    </label>
                    <p className="font-body text-red-900">
                      <span className="font-bold">{gig.blockedInfo.blockedBy.workerName}</span>
                      <span className="text-red-700"> (#{gig.blockedInfo.blockedBy.workerNumber})</span>
                    </p>
                    <p className="font-mono text-xs text-red-700 mt-1 flex items-center gap-1">
                      <Clock size={14} />
                      {new Date(gig.blockedInfo.blockedAt).toLocaleString('es-ES')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Photos */}
            <div className="card">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-heading font-bold text-xl text-slate-900">Photos</h2>
                <button
                  onClick={() => setShowPhotoUploader(!showPhotoUploader)}
                  className="btn-secondary text-sm py-2 px-4"
                >
                  {showPhotoUploader ? 'Cancel' : 'Add Photo'}
                </button>
              </div>

              {showPhotoUploader && (
                <div className="mb-4 p-4 bg-slate-50 rounded-sm border border-slate-200">
                  <PhotoUploader 
                    photos={gig.photos || []}
                    onPhotosChange={handleAddPhoto}
                  />
                </div>
              )}

              {gig.photos && gig.photos.length > 0 ? (
                <div className="photo-grid">
                  {gig.photos.map((photo, index) => (
                    <div key={index} className="photo-item group">
                      <img src={photo} alt={`Foto ${index + 1}`} />
                      <button
                        onClick={() => handleRemovePhoto(photo)}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <ImageIcon size={48} className="mx-auto text-slate-300 mb-2" />
                  <p className="font-body text-slate-500">No photos added</p>
                </div>
              )}
            </div>
          </div>

          {/* Comments */}
          <div className="card h-fit">
            <h2 className="font-heading font-bold text-xl text-slate-900 mb-4">Comments</h2>
            
            <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
              {comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment._id} className="comment-item">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-body font-semibold text-sm text-slate-900">{comment.authorName}</span>
                      <span className="font-mono text-xs text-slate-500">
                        {new Date(comment.createdAt).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                    <p className="font-body text-sm text-slate-600">{comment.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-center font-body text-slate-500 py-4">No comments</p>
              )}
            </div>

            <form onSubmit={handleAddComment}>
              <textarea
                className="input-field mb-2 min-h-[80px] resize-none"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <button type="submit" className="btn-primary w-full">
                Add Comment
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Worker Actions Modal */}
      <WorkerActionModal
        isOpen={workerActionModal.isOpen}
        onClose={() => setWorkerActionModal({ ...workerActionModal, isOpen: false })}
        onConfirm={handleWorkerAction}
        action={workerActionModal.action}
        gigInfo={workerActionModal.gigInfo}
      />
    </div>
  );
}
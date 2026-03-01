import Sidebar from '../components/Sidebar';
import SingleOrder from '../components/Orders/singleOrder';
import { useEffect, useState } from 'react';
import { authAxios } from '../App';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, Image as ImageIcon, Play, CheckCircle, Ban, ClockFading } from 'lucide-react';
import CreateGigModal from '../components/CreateGigModal';

export default function TruckOrders({ user }) {

  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterTruck, setFilterTruck] = useState('');

    useEffect(() => {
      loadData();
    }, []);

    const loadData = async () => {
    try {
      const [gigsRes] = await Promise.all([
        authAxios.get('/gigs'),
        
      ]);
      setGigs(gigsRes.data.gigs);

      // console.log(gigsRes.data)
     
    } catch (error) {
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };



  const handleOperatorChange = async (gigId, employeeNumber) => {
    
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

    const filteredGigs = gigs.filter(gig => {
        const truckMatch = !filterTruck || (gig.truckNumber && gig.truckNumber.toLowerCase().includes(filterTruck.toLowerCase()));
    return truckMatch;
  });

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
              Work Orders
            </h1>
          </div>

          <div className="flex-1 max-w-xs">
            <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
              Filter by Work Order #
            </label>
            <input
              type="text" 
              inputMode="numeric"
              placeholder="Find Work Order..."
              className="input-field"
              value={filterTruck}
              onChange={(e) => setFilterTruck(e.target.value)}
            />
          </div>

          {/* Only QC can be create gigs */}
          {user.role === 'qc' && (
            <button
              onClick={() => {
                setShowModal(true);
              }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              New Gig
            </button>
          )}
        </div>

      <div className="orders-container d-flex flex-column gap-4">
            <SingleOrder gigs={filteredGigs} user={user} />
        </div>

      </div>

      {/* Create Work Order / first Gig Modal (QC Only) */}
          {user.role === 'qc' && showModal && (
            <CreateGigModal user={user}
              onClose={() => {
                setShowModal(false);
              }}
              onSuccess={() => {
                loadData();
                setShowModal(false);
              }}
            />
          )}
      
    </div>
  );
}
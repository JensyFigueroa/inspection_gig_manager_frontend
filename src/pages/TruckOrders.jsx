import Sidebar from '../components/Sidebar';
import SingleOrder from '../components/Orders/singleOrder';
import { useEffect, useState } from 'react';
import { authAxios } from '../App';

import { toast } from 'sonner';

export default function TruckOrders({ user }) {

  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);

    useEffect(() => {
      loadData();
    }, []);

    const loadData = async () => {
    try {
      const [gigsRes] = await Promise.all([
        authAxios.get('/gigs'),
        
      ]);
      setGigs(gigsRes.data);

      // console.log(gigsRes.data)
     
    } catch (error) {
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  };

  console.log(gigs,'TruckOrders')

  
  return (
    <div className="flex">
      <Sidebar user={user} />
      <div className="flex-1 ml-64 p-8 lg:p-12 bg-gray-50 min-h-screen">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-heading font-black text-4xl uppercase tracking-tight text-slate-900 mb-2">
              Truck Orders
            </h1>
            <p>All working orders will be shown here...</p>
          </div>
        </div>

      <div className="orders-container d-flex flex-column gap-4">
            <SingleOrder gigs={gigs} />
            {/* <SingleOrder />
            <SingleOrder />
            <SingleOrder />
            <SingleOrder /> */}
        </div>

      </div>

    
      
    </div>
  );
}
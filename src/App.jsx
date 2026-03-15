import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Auth from './pages/Auth';
import GigDetail from './pages/GigDetail';
import Inspectors from './pages/Operators';
import TruckOrders from './pages/TruckOrders';
import { Toaster } from './components/ui/sonner';
import Statistics from './pages/Statistics';
import GigsOrder from './pages/GigsOrder';
import TasksOrder from './components/TasksOrder/TasksOrder';
import TaskDetail from './pages/TaskDetail';
import Notifications from './pages/Notifications';
import WorkerEfficiency from './pages/WorkerEfficiency';
import MissingPartsList from './pages/MissingPartsList';
import InactivityWarningModal from './components/InactivityWarningModal';
import { useInactivityTimeout } from './hooks/useInactivityTimeout';
import { toast } from 'sonner';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const authAxios = axios.create({
  baseURL: API,
});

authAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
    toast.info('Session expired due to inactivity');
    window.location.href = '/auth';
  }, []);

  const { showWarning, remainingTime, dismissWarning } = useInactivityTimeout(handleLogout, null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.exp * 1000 > Date.now()) {
          authAxios.get('/auth/me')
            .then(res => {
              setUser(res.data);
              setLoading(false);
            })
            .catch(() => {
              localStorage.removeItem('token');
              setLoading(false);
            });
        } else {
          localStorage.removeItem('token');
          setLoading(false);
        }
      } catch (e) {
        localStorage.removeItem('token');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#FF5722] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="font-mono text-sm text-slate-500 uppercase tracking-wider">Loading...</p>
          </div>
        </div>
      );
    }
    return user ? children : <Navigate to="/auth" />;
  };

   return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={user ? <Navigate to="/" /> : <Auth setUser={setUser} />} />
          <Route path="/" element={<ProtectedRoute><TruckOrders user={user} /></ProtectedRoute>} />
          
          {/* Gigs Routes */}
          <Route path="/gigsorder/:wkorder" element={<ProtectedRoute><GigsOrder user={user} /></ProtectedRoute>} />
          <Route path="/gig/:gigId" element={<ProtectedRoute><GigDetail user={user}/></ProtectedRoute>} />
          
          {/* Tasks Routes */}
          <Route path="/tasksorder/:wkorder" element={<ProtectedRoute><TasksOrder user={user} /></ProtectedRoute>} />
          <Route path="/task/:taskId" element={<ProtectedRoute><TaskDetail user={user}/></ProtectedRoute>} />
          
          {/* Missing Parts - Usa MissingPartsList component */}
          <Route path="/missing-parts/:truckNumber" element={<ProtectedRoute><MissingPartsList user={user} /></ProtectedRoute>} />
          
          {/* Other Routes */}
          <Route path="/operators" element={<ProtectedRoute><Inspectors user={user} /></ProtectedRoute>} />
          <Route path="/statistics" element={<ProtectedRoute><Statistics user={user} /></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><Notifications user={user} /></ProtectedRoute>} />
          <Route path="/efficiency" element={<ProtectedRoute><WorkerEfficiency user={user} /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
      
      <Toaster position="top-right" />
      
      {/* Modal de advertencia - SOLO aparece cuando showWarning es true (1 min antes) */}
      {user && (
        <InactivityWarningModal
          isOpen={showWarning}
          remainingTime={remainingTime}
          onStayLoggedIn={dismissWarning}
          onLogout={handleLogout}
          userName={user?.fullName}
        />
      )}
    </div>
  );
}

export default App;

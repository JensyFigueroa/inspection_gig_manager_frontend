import { useState } from 'react';
import axios from 'axios';
import { API } from '../App';
import { toast } from 'sonner';
import { Shield, User, Mail, Lock, MapPin, Users } from 'lucide-react';

// Prefijos de sesión por rol
const getSessionPrefix = (role) => {
  const prefixes = {
    admin: 'admin_session_',
    qc: 'qc_session_',
    lead: 'lead_session_',
    worker: 'worker_session_'
  };
  return prefixes[role] || 'default_session_';
};

export default function Auth({ setUser, onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'worker',
    station: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await axios.post(`${API}${endpoint}`, formData);
      
      const userData = response.data.user;
      const token = response.data.access_token;
      const role = userData.role;
      const prefix = getSessionPrefix(role);
      
      // Guardar con prefijo del rol
      localStorage.setItem(`${prefix}token`, token);
      localStorage.setItem(`${prefix}user`, JSON.stringify(userData));
      localStorage.setItem(`${prefix}lastActivity`, Date.now().toString());
      
      // También mantener compatibilidad con el token genérico
      localStorage.setItem('token', token);
      
      setUser(userData);
      if (onLogin) onLogin(userData, token);
      
      toast.success(isLogin ? '¡Login successful!' : '¡Register successful!');
      window.location.href = '/';
    } catch (error) {
      toast.error(error.response?.data?.error || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const stations = [
    'Station 1',
    'Station 2',
    'Station 3',
    'Station 4',
    'Station 5',
    'Station 6',
    'Eléctrico T/S',
    'Harness',
    'Prep Cab Shop',
    'Body Shop',
    'Paint',
    'Station 9',
    'Station 10',
    'Station Final',
  ];

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Panel izquierdo - Imagen */}
      <div className="hidden lg:block relative overflow-hidden">
        <img
          src="https://revgroup.com/wp-content/uploads/2025/11/REV-Group-2025_LOGO-FINAL-scaled.jpg"
          alt="Línea de Producción"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-slate-900/40"></div>
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Shield size={40} className="text-[#FF5722]" />
            <div>
              <h2 className="font-heading font-black text-4xl uppercase tracking-tight leading-none">
                Inspection Gig Manager
              </h2>
            </div>
          </div>
          <p className="font-mono text-sm text-slate-300 mt-1">Inspection Gig Manager v1.0</p>
          
          
        </div>
      </div>

      {/* Panel derecho - Formulario - RESPONSIVO */}
      <div className="flex items-center justify-center p-4 md:p-6 lg:p-8 xl:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="mb-4 md:mb-6 lg:mb-8 text-center lg:text-left">
            <h1 className="font-heading font-black text-2xl md:text-3xl uppercase tracking-tight text-slate-900 mb-2">
              {isLogin ? 'Login' : 'Register'}
            </h1>
            <p className="font-body text-slate-600 text-sm md:text-base">
              {isLogin ? 'Access your account' : 'Create a new account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4 lg:space-y-5">
            {!isLogin && (
              <>
                <div>
                  <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2 flex items-center gap-2">
                    <User size={14} />
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g: Carlos Rodríguez"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required={!isLogin}
                    data-testid="fullname-input"
                  />
                </div>

                <div>
                  <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2 flex items-center gap-2">
                    <Shield size={14} />
                    Role
                  </label>
                  <select
                    className="input-field"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    required={!isLogin}
                    data-testid="role-select"
                  >
                    <option value="admin">Admin</option>
                    <option value="qc">QC (Quality Control)</option>
                    <option value="lead">Station Leader</option>
                    <option value="worker">Workers</option>
                  </select>
                </div>

                {(formData.role === 'lead' || formData.role === 'worker') && (
                  <div>
                    <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2 flex items-center gap-2">
                      <MapPin size={14} />
                      Station
                    </label>
                    <select
                      className="input-field"
                      value={formData.station}
                      onChange={(e) => setFormData({ ...formData, station: e.target.value })}
                      required={!isLogin && (formData.role === 'lead' || formData.role === 'worker')}
                      data-testid="station-select"
                    >
                      <option value="">Select station...</option>
                      {stations.map((station) => (
                        <option key={station} value={station}>
                          {station}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2 flex items-center gap-2">
                <Mail size={14} />
                Email
              </label>
              <input
                type="email"
                className="input-field"
                placeholder="your@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                data-testid="email-input"
              />
            </div>

            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2 flex items-center gap-2">
                <Lock size={14} />
                Password
              </label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                data-testid="password-input"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
              data-testid="submit-btn"
            >
              {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
            </button>
          </form>

          <div className="mt-4 md:mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="font-body text-sm text-slate-600 hover:text-slate-900 transition-colors"
              data-testid="toggle-auth-mode"
            >
              {isLogin ? "Don't have an account? Register" : 'Already have an account? Log in'}
            </button>
          </div>

          {!isLogin && (
            <div className="mt-4 md:mt-6 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-sm">
              <p className="font-mono text-xs text-blue-800 leading-relaxed">
                <strong className="block mb-2">System Roles:</strong>
                <span className="block">• <strong>Admin:</strong> Full system access and statistics</span>
                <span className="block">• <strong>QC:</strong> Creates and manages all the gigs</span>
                <span className="block">• <strong>Lead:</strong> Assigns gigs to workers</span>
                <span className="block">• <strong>Worker:</strong> Start and complete Gigs</span>
              </p>
            </div>
          )}

          
        </div>
      </div>
    </div>
  );
}

import { AlertTriangle, Clock, RefreshCw } from 'lucide-react';

export default function InactivityWarningModal({ 
  isOpen, 
  remainingTime, 
  onStayLoggedIn, 
  onLogout,
  userName 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-fadeIn">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 md:p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-white/20 rounded-full flex items-center justify-center">
              <AlertTriangle size={28} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-xl md:text-2xl">Session Expiring</h2>
              <p className="text-amber-100 text-sm mt-1">
                {userName ? `Hello, ${userName}` : 'Your session is about to expire'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-amber-100 rounded-full mb-4">
              <Clock size={32} className="text-amber-600" />
            </div>
            <p className="text-slate-600 text-base md:text-lg">Your session will expire in</p>
            <div className="mt-2">
              <span className="text-4xl md:text-5xl font-black text-amber-600">{remainingTime}</span>
              <span className="text-lg md:text-xl text-slate-500 ml-2">seconds</span>
            </div>
          </div>

          <p className="text-sm text-slate-500 text-center mb-6">
            Due to inactivity, your session will be closed. Click "Stay Logged In" to continue.
          </p>

          <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
            <div 
              className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(remainingTime / 60) * 100}%` }}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onLogout}
              className="flex-1 px-4 py-3 border-2 border-slate-300 text-slate-700 font-bold uppercase text-sm rounded hover:bg-slate-50 transition-colors"
            >
              Logout Now
            </button>
            <button
              onClick={onStayLoggedIn}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold uppercase text-sm rounded hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} />
              Stay Logged In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

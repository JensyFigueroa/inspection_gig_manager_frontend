import { useState, useEffect } from 'react';
import { authAxios } from '../App';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function EmployeeAutocomplete({
  employeeNumber,
  employeeName,
  onEmployeeNumberChange,
  onEmployeeNameChange,
  station // Opcional: filtrar por estación
}) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // null, 'found', 'not-found'
  const [debounceTimer, setDebounceTimer] = useState(null);

  useEffect(() => {
    // Limpiar timer anterior
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Si no hay número, resetear
    if (!employeeNumber || employeeNumber.length < 2) {
      setStatus(null);
      return;
    }

    // Debounce de 500ms para evitar muchas peticiones
    const timer = setTimeout(() => {
      searchEmployee(employeeNumber);
    }, 500);

    setDebounceTimer(timer);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [employeeNumber]);

  const searchEmployee = async (number) => {
    try {
      setLoading(true);
      const response = await authAxios.get(`/suggestions/operators/search?employeeNumber=${number}`);
      
      if (response.data.found) {
        setStatus('found');
        onEmployeeNameChange(response.data.operator.fullName);
      } else {
        setStatus('not-found');
        onEmployeeNameChange('');
      }
    } catch (error) {
      console.error('Error searching employee:', error);
      setStatus(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Employee Number */}
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
          Employee Number *
        </label>
        <div className="relative">
          <input
            type="text"
            className={`input-field pr-10 ${
              status === 'found' ? 'border-green-500' : 
              status === 'not-found' ? 'border-red-500' : ''
            }`}
            placeholder="e.g., 12345"
            value={employeeNumber}
            onChange={(e) => onEmployeeNumberChange(e.target.value)}
            required
            autoFocus
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {loading && (
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            )}
            {!loading && status === 'found' && (
              <CheckCircle className="w-5 h-5 text-green-500" />
            )}
            {!loading && status === 'not-found' && (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
        </div>
        
        {/* Mensaje de error */}
        {status === 'not-found' && (
          <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Employee Number not found. Contact your Lead.
          </p>
        )}
        {status === 'found' && (
          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Employee found
          </p>
        )}
      </div>

      {/* Employee Name - Autocompletado */}
      <div>
        <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
          Employee Name *
        </label>
        <input
          type="text"
          className={`input-field ${status === 'found' ? 'bg-green-50' : ''}`}
          placeholder="Full name"
          value={employeeName}
          onChange={(e) => onEmployeeNameChange(e.target.value)}
          required
          readOnly={status === 'found'}
        />
        {status === 'found' && (
          <p className="text-xs text-slate-500 mt-1">
            ✓ Auto-filled from database
          </p>
        )}
      </div>
    </div>
  );
}

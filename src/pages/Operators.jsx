import { useState, useEffect } from 'react';
import { authAxios } from '../App';
import { toast } from 'sonner';
import Sidebar from '../components/Sidebar';
import { Plus, Trash2, Mail, Calendar } from 'lucide-react';

export default function Operators({ user }) {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    employeeNumber: '', 
    fullName: '', 
    position: '', 
    station: user.station || '',
  });

  useEffect(() => {
    loadOperators();
  }, []);

  const loadOperators = async () => {
    try {
      const response = await authAxios.get('/operators');
      setOperators(response.data);

    } catch (error) {
      toast.error('Error loading operators');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData)
    try {
      const response = await authAxios.post('/operators', formData);
      setOperators([...operators, response.data]);
      setFormData({ employeeNumber: '', fullName: '', position: '', station: user.station });
      setShowForm(false);
      toast.success('Operator created');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error creating operator');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Are you sure you want to delete this operator?')) return;

    try {
      await authAxios.delete(`/operators/${id}`);
      setOperators(operators.filter(i => i._id !== id));
      toast.success('Operator deleted');
    } catch (error) {
      toast.error('Error deleting operator');
    }
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
              Operators
            </h1>
            <p className="font-body text-slate-600">
              {user.role === 'qc' ? 'Manages the Operatos team' : 'See the list of Operatos'}
            </p>
          </div>
          
          {/* Only QC can create Operators */}
          {user.role === 'lead' && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              New Operator
            </button>
          )}
        </div>

        {/* Create Inspector Form */}
        {showForm && user.role === 'lead' && (
          <div className="card mb-6 max-w-md animate-fadeIn">
            <h2 className="font-heading font-bold text-xl text-slate-900 mb-4">New Operator</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
                  Employee Number
                </label>
                <input
                  type="Number"
                  className="input-field"
                  placeholder="e.g: 123456"
                  value={formData.employeeNumber}
                  onChange={(e) => setFormData({ ...formData, employeeNumber: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
                  Full name
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g: Carlos Rodríguez"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
                  Position
                </label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g: Installer"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ employeeNumber: '', fullName: '', position: '' });
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List of operators */}

         {user.role === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            { operators.map((operator, index) => operator.station  && (
              <div
                key={operator._id}
                className="card fade-in-up hover:shadow-lg transition-shadow"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-3">
                      <span className="text-white font-heading font-bold text-xl">
                        {operator.employeeNumber}
                      </span>
                      <span className="text-white font-heading font-bold text-xl">
                        {operator.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-lg text-slate-900 mb-1">
                      {operator.fullName}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                      <Mail size={14} />
                      <p className="font-mono text-xs">{operator.position}</p>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar size={14} />
                      <p className="font-mono text-xs">
                        Created: {new Date(operator.createdAt).toLocaleDateString('en-US')}
                      </p>
                    </div>
                  </div>
                  
                  {/* Solo QC puede eliminar */}
                  {user.role === 'lead' && (
                    <button
                      onClick={() => handleDelete(operator._id)}
                      className="p-2 hover:bg-red-50 rounded transition-colors"
                      title="Remove operator"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase tracking-wider text-slate-500">
                      {/* ID: {operator._id.slice(-6)} */}
                      ID: {operator.employeeNumber}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold uppercase rounded">
                      Operator
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}



        {operators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            { operators.map((operator, index) => operator.station === user.station  && (
              <div
                key={operator._id}
                className="card fade-in-up hover:shadow-lg transition-shadow"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-3">
                      <span className="text-white font-heading font-bold text-xl">
                        {operator.employeeNumber}
                      </span>
                      <span className="text-white font-heading font-bold text-xl">
                        {operator.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-heading font-bold text-lg text-slate-900 mb-1">
                      {operator.fullName}
                    </h3>
                    <div className="flex items-center gap-2 text-slate-600 mb-2">
                      <Mail size={14} />
                      <p className="font-mono text-xs">{operator.position}</p>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar size={14} />
                      <p className="font-mono text-xs">
                        Created: {new Date(operator.createdAt).toLocaleDateString('en-US')}
                      </p>
                    </div>
                  </div>
                  
                  {/* Solo QC puede eliminar */}
                  {user.role === 'lead' && (
                    <button
                      onClick={() => handleDelete(operator._id)}
                      className="p-2 hover:bg-red-50 rounded transition-colors"
                      title="Remove operator"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs uppercase tracking-wider text-slate-500">
                      {/* ID: {operator._id.slice(-6)} */}
                      ID: {operator.employeeNumber}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold uppercase rounded">
                      Operator
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <div className="mb-4">
              <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={40} className="text-slate-400" />
              </div>
              <h3 className="font-heading font-bold text-xl text-slate-900 mb-2">
                There aren't operators registered yet
              </h3>
              <p className="font-body text-slate-600 mb-4">
                {user.role === 'lead' 
                  ? 'Begin by adding your first operator to the system'
                  : 'No operators have been registered in the system yet'}
              </p>
              {user.role === 'lead' && (
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Plus size={18} />
                  Create First Operator
                </button>
              )}
            </div>
          </div>
        )}

        {/* statistic */}
        {/* {operators.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <h3 className="font-mono text-xs uppercase tracking-wider mb-2 opacity-90">
                Total Operators
              </h3>
              <p className="font-heading font-black text-4xl">
                {operators.length}
              </p>
            </div>

            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
              <h3 className="font-mono text-xs uppercase tracking-wider mb-2 opacity-90">
                Active this Month
              </h3>
              <p className="font-heading font-black text-4xl">
                {operators.length}
              </p>
            </div>

            <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <h3 className="font-mono text-xs uppercase tracking-wider mb-2 opacity-90">
                Last Added Operator 
              </h3>
              <p className="font-body font-bold text-lg">
                {operators.length > 0 
                  ? new Date(operators[operators.length - 1].createdAt).toLocaleDateString('es-ES')
                  : '-'}
              </p>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}
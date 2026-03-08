import { useState, useEffect } from 'react';
import { authAxios } from '../App';
import Sidebar from '../components/Sidebar';
import { toast } from 'sonner';
import { Calendar, Clock, TrendingUp, User, ChevronDown, ChevronUp } from 'lucide-react';

export default function WorkerEfficiency({ user }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [efficiencyData, setEfficiencyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedWorker, setExpandedWorker] = useState(null);

  useEffect(() => {
    loadEfficiencyData();
  }, [date]);

  const loadEfficiencyData = async () => {
    try {
      setLoading(true);
      const response = await authAxios.get(`/efficiency/daily/${date}`);
      setEfficiencyData(response.data);
    } catch (error) {
      toast.error('Error loading efficiency data');
    } finally {
      setLoading(false);
    }
  };

  const getEfficiencyColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600 bg-green-100';
    if (percentage >= 60) return 'text-yellow-600 bg-yellow-100';
    if (percentage >= 40) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getEfficiencyBarColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (user.role !== 'lead' && user.role !== 'qc' && user.role !== 'admin') {
    return (
      <div className="flex">
        <Sidebar user={user} />
        <div className="flex-1 ml-64 p-8 lg:p-12 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="text-center">
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-heading font-black text-4xl uppercase tracking-tight text-slate-900 mb-2">
              Worker Efficiency
            </h1>
            <p className="text-slate-600">
              Track daily worker productivity (10-hour workday)
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div>
              <label className="font-mono text-xs uppercase tracking-wider text-slate-500 block mb-2">
                Select Date
              </label>
              <input
                type="date"
                className="input-field"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-[#FF5722] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <User className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Workers</p>
                    <p className="text-2xl font-bold text-slate-900">{efficiencyData?.totalWorkers || 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-100 rounded-lg">
                    <Clock className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Work Day</p>
                    <p className="text-2xl font-bold text-slate-900">{efficiencyData?.workDayHours || 10}h</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Avg Efficiency</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {efficiencyData?.workers?.length > 0
                        ? Math.round(efficiencyData.workers.reduce((sum, w) => sum + w.efficiencyPercentage, 0) / efficiencyData.workers.length)
                        : 0}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Date</p>
                    <p className="text-2xl font-bold text-slate-900">{date}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Workers List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <h2 className="font-semibold text-lg text-slate-900">Worker Details</h2>
              </div>

              {!efficiencyData?.workers?.length ? (
                <div className="p-12 text-center">
                  <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No work recorded for this date</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {efficiencyData.workers.map((worker, index) => (
                    <div key={worker.employeeNumber} className="hover:bg-slate-50 transition-colors">
                      <div
                        className="p-6 cursor-pointer"
                        onClick={() => setExpandedWorker(expandedWorker === index ? null : index)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                              <span className="text-lg font-bold text-slate-600">
                                {worker.employeeName?.charAt(0) || '?'}
                              </span>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{worker.employeeName}</p>
                              <p className="text-sm text-slate-500">#{worker.employeeNumber} • {worker.station}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-sm text-slate-500">Time Worked</p>
                              <p className="font-semibold text-slate-900">{formatTime(worker.totalWorkMinutes)}</p>
                            </div>

                            <div className="text-right">
                              <p className="text-sm text-slate-500">Items Completed</p>
                              <p className="font-semibold text-slate-900">
                                {worker.gigsCompleted} gigs, {worker.tasksCompleted} tasks
                              </p>
                            </div>

                            <div className="w-32">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm text-slate-500">Efficiency</span>
                                <span className={`text-sm font-bold px-2 py-0.5 rounded ${getEfficiencyColor(worker.efficiencyPercentage)}`}>
                                  {worker.efficiencyPercentage}%
                                </span>
                              </div>
                              <div className="w-full bg-slate-200 rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full transition-all ${getEfficiencyBarColor(worker.efficiencyPercentage)}`}
                                  style={{ width: `${Math.min(worker.efficiencyPercentage, 100)}%` }}
                                />
                              </div>
                            </div>

                            <div>
                              {expandedWorker === index ? (
                                <ChevronUp className="w-5 h-5 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Sessions */}
                      {expandedWorker === index && (
                        <div className="px-6 pb-6 pt-2 bg-slate-50">
                          <h4 className="font-medium text-slate-700 mb-3">Work Sessions</h4>
                          <div className="space-y-2">
                            {worker.sessions.map((session, sIdx) => (
                              <div key={sIdx} className="flex items-center justify-between bg-white p-3 rounded-lg text-sm">
                                <div className="flex items-center gap-3">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    session.type === 'gig' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                  }`}>
                                    {session.type.toUpperCase()}
                                  </span>
                                  <span className="text-slate-600">{session.description}</span>
                                </div>
                                <div className="flex items-center gap-4 text-slate-500">
                                  <span>{new Date(session.startTime).toLocaleTimeString()} - {new Date(session.endTime).toLocaleTimeString()}</span>
                                  <span className="font-medium text-slate-900">{formatTime(session.durationMinutes)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

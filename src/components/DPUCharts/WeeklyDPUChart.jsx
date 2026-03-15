import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { authAxios } from '../../App';
import { toast } from 'sonner';

export default function WeeklyDPUChart({ line = 'RR' }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('comparison');

  useEffect(() => {
    loadDPUData();
  }, [line]);

  const loadDPUData = async () => {
    try {
      setLoading(true);
      const response = await authAxios.get(`/dpu/weekly-comparison/${line}`);
      setData(response.data);
    } catch (error) {
      console.error('Error loading DPU data:', error);
      toast.error('Error loading DPU data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center text-slate-500 py-8">
        No DPU data available
      </div>
    );
  }

  const chartData = data.data.map(item => ({
    station: item.station,
    [data.currentWeek.label]: item.currentWeekDPU,
    [data.previousWeek.label]: item.previousWeekDPU,
    current: item.currentWeekDPU,
    change: parseFloat(item.change)
  }));

  const sortedForPareto = [...chartData].sort((a, b) => b.current - a.current);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setViewMode('current')}
          className={`px-3 py-2 text-xs md:text-sm font-medium rounded-lg transition-colors ${
            viewMode === 'current'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Current Week Only
        </button>
        <button
          onClick={() => setViewMode('comparison')}
          className={`px-3 py-2 text-xs md:text-sm font-medium rounded-lg transition-colors ${
            viewMode === 'comparison'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Week Comparison
        </button>
      </div>

      {viewMode === 'current' && (
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
          <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-4">
            Pareto by station DPU week {data.currentWeek.label}
            <span className="text-blue-600 ml-2">{line} Line</span>
          </h3>
          <div className="h-[300px] md:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedForPareto} margin={{ top: 20, right: 20, left: 0, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="station" 
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  domain={[0, 'auto']}
                  width={40}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Bar 
                  dataKey="current" 
                  name="DPU"
                  fill="#0891b2" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {viewMode === 'comparison' && (
        <div className="bg-white rounded-lg p-4 md:p-6 shadow-sm">
          <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-4">
            Pareto by station DPU week {data.currentWeek.label}
            <span className="text-blue-600 ml-2">{line} line</span>
          </h3>
          <div className="h-[350px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="station" 
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis 
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  domain={[0, 'auto']}
                  width={40}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
                />
                <Bar 
                  dataKey={data.previousWeek.label}
                  name={data.previousWeek.label}
                  fill="#0891b2" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey={data.currentWeek.label}
                  name={data.currentWeek.label}
                  fill="#ea580c" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="font-semibold text-slate-900">DPU Details by Station</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px]">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase">Station</th>
                <th className="px-3 md:px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">{data.previousWeek.label}</th>
                <th className="px-3 md:px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">{data.currentWeek.label}</th>
                <th className="px-3 md:px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase">Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.data.map((item) => (
                <tr key={item.station} className="hover:bg-slate-50">
                  <td className="px-3 md:px-4 py-3 font-medium text-slate-900 text-sm">{item.station}</td>
                  <td className="px-3 md:px-4 py-3 text-right text-slate-600 text-sm">{item.previousWeekDPU}</td>
                  <td className="px-3 md:px-4 py-3 text-right text-slate-900 font-medium text-sm">{item.currentWeekDPU}</td>
                  <td className={`px-3 md:px-4 py-3 text-right font-medium text-sm ${
                    parseFloat(item.change) > 0 ? 'text-red-600' : 
                    parseFloat(item.change) < 0 ? 'text-green-600' : 'text-slate-500'
                  }`}>
                    {parseFloat(item.change) > 0 ? '+' : ''}{item.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

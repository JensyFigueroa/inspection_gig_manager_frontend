import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from "recharts";
import { BarChart3, TrendingUp, PieChart } from "lucide-react";

// Colores para los gráficos
const CHART_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", 
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1"
];

// Función helper para nombre del día
const getDayName = (index) => {
  const days = ["Mon truck", "Tue truck", "Wed truck", "Thur truck", "Fri truck"];
  return days[index] || `Truck ${index + 1}`;
};

const DashboardCharts = ({ tracker, stationTotals, truckTotals, stationAverages }) => {
  if (!tracker) return null;

  // Preparar datos para gráfico de barras por estación
  const stationBarData = tracker.stations.map((station) => ({
    name: station.length > 10 ? station.substring(0, 10) + '...' : station,
    fullName: station,
    total: stationTotals[station] || 0,
    average: Number((stationAverages[station] || 0).toFixed(2))
  }));

  // Preparar datos para gráfico de pie (distribución por camión)
  const pieData = tracker.trucks.map((truck, idx) => ({
    name: truck.truck_number,
    value: truckTotals[idx] || 0,
    customer: truck.customer
  }));

  // Preparar datos para gráfico apilado (estación por camión)
  const stationByTruckData = tracker.stations.map((station) => {
    const data = { name: station.length > 8 ? station.substring(0, 8) + '...' : station };
    tracker.trucks.forEach((truck, idx) => {
      data[`truck${idx + 1}`] = truck.values[station] || 0;
    });
    return data;
  });

  // Top 5 estaciones
  const topStations = [...stationBarData]
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Calcular totales generales
  const totalProduction = Object.values(stationTotals).reduce((a, b) => a + b, 0);
  const avgProduction = totalProduction / (tracker.trucks.length || 1);

  return (
    <div className="space-y-6">
      {/* TARJETAS DE RESUMEN */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-blue-100 text-xs uppercase">Total Producción</p>
              <p className="text-3xl font-bold">{totalProduction}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-emerald-100 text-xs uppercase">Promedio General</p>
              <p className="text-3xl font-bold">{avgProduction.toFixed(1)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <PieChart className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-orange-100 text-xs uppercase">Camiones</p>
              <p className="text-3xl font-bold">{tracker.trucks.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 opacity-80" />
            <div>
              <p className="text-purple-100 text-xs uppercase">Estaciones</p>
              <p className="text-3xl font-bold">{tracker.stations.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* GRÁFICOS FILA 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Barras - Total por Estación */}
        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-500" />
            Total por Estación
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stationBarData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10, fill: '#6B7280' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px'
                }}
                labelFormatter={(label, payload) => payload[0]?.payload?.fullName || label}
              />
              <Bar dataKey="total" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Total" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Pie - Distribución por Camión */}
        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-emerald-500" />
            Distribución por Camión
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value, name, props) => [value, props.payload.customer]}
              />
              <Legend />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GRÁFICOS FILA 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico Apilado - Por Camión y Estación */}
        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            Comparativa por Camión y Estación
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stationByTruckData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10, fill: '#6B7280' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
              <Tooltip />
              <Legend />
              {tracker.trucks.map((truck, idx) => (
                <Bar 
                  key={idx}
                  dataKey={`truck${idx + 1}`} 
                  stackId="a"
                  fill={CHART_COLORS[idx % CHART_COLORS.length]} 
                  name={`${getDayName(idx)} (${truck.truck_number})`}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Área - Tendencia */}
        <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            Tendencia de Producción
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stationBarData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10, fill: '#6B7280' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
              <Tooltip 
                labelFormatter={(label, payload) => payload[0]?.payload?.fullName || label}
              />
              <Area 
                type="monotone" 
                dataKey="total" 
                stroke="#8B5CF6" 
                fillOpacity={1} 
                fill="url(#colorTotal)" 
                name="Total"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TOP 5 ESTACIONES */}
      <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Top 5 Estaciones con Mayor Producción</h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {topStations.map((station, idx) => (
            <div 
              key={idx} 
              className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-center gap-2 mb-2">
                <span 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                  style={{ backgroundColor: CHART_COLORS[idx] }}
                >
                  {idx + 1}
                </span>
                <span className="font-medium text-gray-700 text-sm truncate" title={station.fullName}>
                  {station.fullName}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{station.total}</p>
              <p className="text-xs text-gray-500">Promedio: {station.average}</p>
            </div>
          ))}
        </div>s
      </div>
    </div>
  );
};

export default DashboardCharts;
import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { authAxios } from '../../App';

const AvgDPUChart = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchDPUHistory();
  }, [year]);

  const fetchDPUHistory = async () => {
    try {
      setLoading(true);
      const response = await authAxios.get(`gigs/dpu-history?year=${year}`);
      setData(response.data.data || []);
    } catch (error) {
      console.error('Error fetching DPU history:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar solo semanas con datos para la línea
  const dataWithValues = data.filter(d => d.avgDPU !== null);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '350px',
        color: '#6b7280'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div>
      {/* Selector de año */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        marginBottom: '16px' 
      }}>
        <select 
          value={year} 
          onChange={(e) => setYear(parseInt(e.target.value))}
          style={{
            padding: '8px 16px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white',
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          {[2024, 2025, 2026, 2027].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>
      
      <ResponsiveContainer width="100%" height={350}>
        <LineChart 
          data={data} 
          margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="week" 
            tick={{ fontSize: 9, fill: '#6b7280' }}
            angle={-90}
            textAnchor="end"
            height={80}
            interval={0}
            dy={10}
          />
          <YAxis 
            domain={[0, 100]}
            ticks={[0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            label={{ 
              value: 'AVG DPU', 
              angle: -90, 
              position: 'insideLeft',
              style: { fontSize: 12, fill: '#374151' }
            }}
          />
          <Tooltip 
            formatter={(value) => [value !== null ? value.toFixed(2) : 'No data', 'AVG DPU']}
            labelFormatter={(label) => `Week: ${label}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="avgDPU" 
            stroke="#1e3a5f"
            strokeWidth={2}
            dot={{ fill: '#1e3a5f', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#3b82f6' }}
            connectNulls={true}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Resumen de datos */}
      {dataWithValues.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '24px',
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#f9fafb',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#374151'
        }}>
          <span>
            <strong>Weeks with data:</strong> {dataWithValues.length}
          </span>
          <span>
            <strong>Highest AVG:</strong> {Math.max(...dataWithValues.map(d => d.avgDPU)).toFixed(2)}
          </span>
          <span>
            <strong>Lowest AVG:</strong> {Math.min(...dataWithValues.map(d => d.avgDPU)).toFixed(2)}
          </span>
          <span>
            <strong>Overall AVG:</strong> {(dataWithValues.reduce((sum, d) => sum + d.avgDPU, 0) / dataWithValues.length).toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
};

export default AvgDPUChart;
import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from 'recharts';
import "../PrintModal/PrintModal.css";

const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899'];

const PrintModal = ({ 
  isOpen, 
  onClose, 
  tableData,
  barChartData,
  pieChartData,
  stackedBarData,
  areaChartData,
  avgDPUData,
  trucks,
  weekStarting,
  gigsByStation,
  STATIONS,
  getStationTotal,
  getStationAverage,
  getColumnTotal,
  getGrandTotal,
  getGrandAverage,
  getGigCount,
  trucksWithData
}) => {
  const [selectedItems, setSelectedItems] = useState({
    table: true,
    avgDPUChart: false,
    barChart: false,
    pieChart: false,
    stackedBarChart: false,
    areaChart: false
  });

  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `DPU_Report_${new Date().toISOString().split('T')[0]}`,
    onAfterPrint: () => onClose()
  });

  const handleCheckboxChange = (item) => {
    setSelectedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const selectAll = () => {
    setSelectedItems({
      table: true,
      avgDPUChart: true,
      barChart: true,
      pieChart: true,
      stackedBarChart: true,
      areaChart: true
    });
  };

  const deselectAll = () => {
    setSelectedItems({
      table: false,
      avgDPUChart: false,
      barChart: false,
      pieChart: false,
      stackedBarChart: false,
      areaChart: false
    });
  };

  const hasSelection = Object.values(selectedItems).some(v => v);

  if (!isOpen) return null;

  return (
    <div className="print-modal-overlay">
      <div className="print-modal">
        <div className="print-modal-header">
          <h2>🖨️ Print Options</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="print-modal-body">
          <p className="print-instruction">Select the elements you want to print:</p>
          
          <div className="select-actions">
            <button className="select-btn" onClick={selectAll}>Select All</button>
            <button className="select-btn" onClick={deselectAll}>Deselect All</button>
          </div>

          <div className="checkbox-list">
            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedItems.table}
                onChange={() => handleCheckboxChange('table')}
              />
              <span className="checkbox-label">📊 DPU Tracker Table</span>
            </label>

            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedItems.avgDPUChart}
                onChange={() => handleCheckboxChange('avgDPUChart')}
              />
              <span className="checkbox-label">📈 AVG DPU RR Chart</span>
            </label>

            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedItems.barChart}
                onChange={() => handleCheckboxChange('barChart')}
              />
              <span className="checkbox-label">📊 Total per Station Chart</span>
            </label>

            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedItems.pieChart}
                onChange={() => handleCheckboxChange('pieChart')}
              />
              <span className="checkbox-label">🔵 Distribution by Truck Chart</span>
            </label>

            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedItems.stackedBarChart}
                onChange={() => handleCheckboxChange('stackedBarChart')}
              />
              <span className="checkbox-label">📈 Comparison by Truck and Station</span>
            </label>

            <label className="checkbox-item">
              <input
                type="checkbox"
                checked={selectedItems.areaChart}
                onChange={() => handleCheckboxChange('areaChart')}
              />
              <span className="checkbox-label">📈 Production Trend Chart</span>
            </label>
          </div>
        </div>

        <div className="print-modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button 
            className="print-btn" 
            onClick={handlePrint}
            disabled={!hasSelection}
          >
            🖨️ Print Selected
          </button>
        </div>
      </div>

      {/* Contenido a imprimir - VISIBLE para que ref funcione */}
      <div style={{ 
        position: 'absolute', 
        left: '-9999px', 
        top: 0,
        width: '210mm'
      }}>
        <div ref={printRef} style={{ padding: '20px', background: 'white' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #e5e7eb' }}>
            <h1 style={{ fontSize: '24px', color: '#1f2937', margin: '0 0 8px 0' }}>
              ROAD RESCUE PRODUCTION LINE DPU TRACKER
            </h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>
              Generated: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Tabla */}
          {selectedItems.table && trucks && trucks.length > 0 && (
            <div style={{ marginBottom: '40px', pageBreakInside: 'avoid' }}>
              <h2 style={{ fontSize: '18px', color: '#374151', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
                DPU Tracker Table - Week: {weekStarting}
              </h2>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #d1d5db', padding: '6px', background: '#dbeafe', fontWeight: '600' }}>Station</th>
                    {trucks.map((truck, idx) => (
                      <th key={idx} style={{ border: '1px solid #d1d5db', padding: '6px', background: '#dbeafe', fontWeight: '600' }}>
                        {truck.truckNumber || '-'}
                      </th>
                    ))}
                    <th style={{ border: '1px solid #d1d5db', padding: '6px', background: '#dbeafe', fontWeight: '600' }}>TOTAL</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '6px', background: '#dbeafe', fontWeight: '600' }}>AVG</th>
                  </tr>
                </thead>
                <tbody>
                  {STATIONS.map((station, idx) => (
                    <tr key={station} style={{ background: idx % 2 === 0 ? '#f9fafb' : 'white' }}>
                      <td style={{ border: '1px solid #d1d5db', padding: '6px', fontWeight: '500' }}>{station}</td>
                      {trucks.map((truck, tIdx) => (
                        <td key={tIdx} style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center' }}>
                          {getGigCount(station, truck.truckNumber)}
                        </td>
                      ))}
                      <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center', fontWeight: '600' }}>
                        {getStationTotal(station)}
                      </td>
                      <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center' }}>
                        {getStationAverage(station).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ background: '#dbeafe' }}>
                    <td style={{ border: '1px solid #d1d5db', padding: '6px', fontWeight: '700' }}>Total</td>
                    {trucks.map((truck, idx) => (
                      <td key={idx} style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center', fontWeight: '700' }}>
                        {getColumnTotal(truck.truckNumber)}
                      </td>
                    ))}
                    <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center', fontWeight: '700' }}>
                      {getGrandTotal()}
                    </td>
                    <td style={{ border: '1px solid #d1d5db', padding: '6px', textAlign: 'center', fontWeight: '700' }}>
                      {getGrandAverage().toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* AVG DPU Chart */}
          {selectedItems.avgDPUChart && avgDPUData && avgDPUData.length > 0 && (
            <div style={{ marginBottom: '40px', pageBreakInside: 'avoid' }}>
              <h2 style={{ fontSize: '18px', color: '#374151', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
                AVG DPU RR
              </h2>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={avgDPUData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" tick={{ fontSize: 8 }} angle={-45} textAnchor="end" height={60} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="avgDPU" stroke="#1e3a5f" strokeWidth={2} dot={{ r: 3 }} connectNulls={true} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Bar Chart */}
          {selectedItems.barChart && barChartData && barChartData.length > 0 && (
            <div style={{ marginBottom: '40px', pageBreakInside: 'avoid' }}>
              <h2 style={{ fontSize: '18px', color: '#374151', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
                Total per Station
              </h2>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Pie Chart */}
          {selectedItems.pieChart && pieChartData && pieChartData.length > 0 && (
            <div style={{ marginBottom: '40px', pageBreakInside: 'avoid' }}>
              <h2 style={{ fontSize: '18px', color: '#374151', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
                Distribution by Truck
              </h2>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Stacked Bar Chart */}
          {selectedItems.stackedBarChart && stackedBarData && stackedBarData.length > 0 && (
            <div style={{ marginBottom: '40px', pageBreakInside: 'avoid' }}>
              <h2 style={{ fontSize: '18px', color: '#374151', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
                Comparison by Truck and Station
              </h2>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stackedBarData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    {trucks && trucks.filter(t => t.truckNumber).map((truck, idx) => (
                      <Bar 
                        key={truck.truckNumber} 
                        dataKey={`truck${idx}`} 
                        name={truck.truckNumber}
                        fill={COLORS[idx % COLORS.length]} 
                        stackId="a"
                      />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Area Chart */}
          {selectedItems.areaChart && areaChartData && areaChartData.length > 0 && (
            <div style={{ marginBottom: '40px', pageBreakInside: 'avoid' }}>
              <h2 style={{ fontSize: '18px', color: '#374151', marginBottom: '16px', paddingBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
                Production Trend
              </h2>
              <div style={{ width: '100%', height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#8B5CF6" fill="#C4B5FD" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrintModal;

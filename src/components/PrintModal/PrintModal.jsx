import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
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
  trucksWithData,
  weeklyComparisonData,
  threeWeeksChartData,
  twoWeeksChartData
}) => {
  const [selectedItems, setSelectedItems] = useState({
    table: true,
    threeWeeksChart: false,
    twoWeeksChart: false,
    avgDPUChart: false,
    barChart: false,
    pieChart: false,
    stackedBarChart: false,
    areaChart: false
  });

  const [showPrintContent, setShowPrintContent] = useState(false);
  const printRef = useRef(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `DPU_Report_${new Date().toISOString().split('T')[0]}`,
    pageStyle: `
      @page {
        size: landscape;
        margin: 10mm;
      }
      @media print {
        html, body {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
      }
    `,
    onBeforePrint: () => {
      return new Promise((resolve) => {
        setShowPrintContent(true);
        setTimeout(resolve, 500);
      });
    },
    onAfterPrint: () => {
      setShowPrintContent(false);
      onClose();
    }
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
      threeWeeksChart: true,
      twoWeeksChart: true,
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
      threeWeeksChart: false,
      twoWeeksChart: false,
      avgDPUChart: false,
      barChart: false,
      pieChart: false,
      stackedBarChart: false,
      areaChart: false
    });
  };

  const hasSelection = Object.values(selectedItems).some(v => v);

  if (!isOpen) return null;

  // Estilos comunes para las páginas
  const pageStyle = {
    width: '1000px',
    minHeight: '700px',
    padding: '30px',
    background: 'white',
    pageBreakAfter: 'always',
    boxSizing: 'border-box'
  };

  const headerStyle = {
    textAlign: 'center',
    marginBottom: '25px',
    paddingBottom: '15px',
    borderBottom: '3px solid #3b82f6'
  };

  const titleStyle = {
    fontSize: '20px',
    color: '#1f2937',
    margin: '0 0 8px 0',
    fontWeight: '700'
  };

  const subtitleStyle = {
    fontSize: '12px',
    color: '#6b7280',
    margin: 0
  };

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
              <input type="checkbox" checked={selectedItems.table} onChange={() => handleCheckboxChange('table')} />
              <span className="checkbox-label">📊 DPU Tracker Table</span>
            </label>
            <label className="checkbox-item">
              <input type="checkbox" checked={selectedItems.threeWeeksChart} onChange={() => handleCheckboxChange('threeWeeksChart')} />
              <span className="checkbox-label">📊 Pareto by Station (Start, Last, Current Week)</span>
            </label>
            <label className="checkbox-item">
              <input type="checkbox" checked={selectedItems.twoWeeksChart} onChange={() => handleCheckboxChange('twoWeeksChart')} />
              <span className="checkbox-label">📊 Pareto by Station DPU (Last vs Current Week)</span>
            </label>
            <label className="checkbox-item">
              <input type="checkbox" checked={selectedItems.avgDPUChart} onChange={() => handleCheckboxChange('avgDPUChart')} />
              <span className="checkbox-label">📈 AVG DPU RR Chart</span>
            </label>
            <label className="checkbox-item">
              <input type="checkbox" checked={selectedItems.barChart} onChange={() => handleCheckboxChange('barChart')} />
              <span className="checkbox-label">📊 Total per Station Chart</span>
            </label>
            <label className="checkbox-item">
              <input type="checkbox" checked={selectedItems.pieChart} onChange={() => handleCheckboxChange('pieChart')} />
              <span className="checkbox-label">🔵 Distribution by Truck Chart</span>
            </label>
            <label className="checkbox-item">
              <input type="checkbox" checked={selectedItems.stackedBarChart} onChange={() => handleCheckboxChange('stackedBarChart')} />
              <span className="checkbox-label">📈 Comparison by Truck and Station</span>
            </label>
            <label className="checkbox-item">
              <input type="checkbox" checked={selectedItems.areaChart} onChange={() => handleCheckboxChange('areaChart')} />
              <span className="checkbox-label">📈 Production Trend Chart</span>
            </label>
          </div>
        </div>

        <div className="print-modal-footer">
          <button className="cancel-btn" onClick={onClose}>Cancel</button>
          <button className="print-btn" onClick={handlePrint} disabled={!hasSelection}>
            🖨️ Print Selected
          </button>
        </div>
      </div>

      {/* Contenido a imprimir - VISIBLE cuando showPrintContent es true */}
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'white',
        zIndex: showPrintContent ? 9999 : -1,
        opacity: showPrintContent ? 1 : 0,
        overflow: 'auto',
        pointerEvents: showPrintContent ? 'auto' : 'none'
      }}>
        <div ref={printRef} style={{ padding: '20px' }}>
          
          {/* PÁGINA 1: Tabla */}
          {selectedItems.table && trucks && trucks.length > 0 && (
            <div style={pageStyle}>
              <div style={headerStyle}>
                <h1 style={titleStyle}>ROAD RESCUE PRODUCTION LINE DPU TRACKER</h1>
                <p style={subtitleStyle}>Week Starting: {weekStarting} | Generated: {new Date().toLocaleDateString()}</p>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #d1d5db', padding: '8px', background: '#dbeafe', fontWeight: '600' }}>Station</th>
                    {trucks.map((truck, idx) => (
                      <th key={idx} style={{ border: '1px solid #d1d5db', padding: '8px', background: '#dbeafe', fontWeight: '600' }}>
                        {truck.truckNumber || '-'}
                      </th>
                    ))}
                    <th style={{ border: '1px solid #d1d5db', padding: '8px', background: '#dbeafe', fontWeight: '600' }}>TOTAL</th>
                    <th style={{ border: '1px solid #d1d5db', padding: '8px', background: '#dbeafe', fontWeight: '600' }}>AVG</th>
                  </tr>
                </thead>
                <tbody>
                  {STATIONS && STATIONS.map((station, idx) => (
                    <tr key={station} style={{ background: idx % 2 === 0 ? '#f9fafb' : 'white' }}>
                      <td style={{ border: '1px solid #d1d5db', padding: '8px', fontWeight: '500' }}>{station}</td>
                      {trucks.map((truck, tIdx) => (
                        <td key={tIdx} style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'center' }}>
                          {truck.truckNumber ? getGigCount(station, truck.truckNumber) : '-'}
                        </td>
                      ))}
                      <td style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'center', fontWeight: '600' }}>{getStationTotal(station)}</td>
                      <td style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'center' }}>{getStationAverage(station).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr style={{ background: '#dbeafe' }}>
                    <td style={{ border: '1px solid #d1d5db', padding: '8px', fontWeight: '700' }}>Total</td>
                    {trucks.map((truck, idx) => (
                      <td key={idx} style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'center', fontWeight: '700' }}>
                        {truck.truckNumber ? getColumnTotal(truck.truckNumber) : '-'}
                      </td>
                    ))}
                    <td style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'center', fontWeight: '700' }}>{getGrandTotal()}</td>
                    <td style={{ border: '1px solid #d1d5db', padding: '8px', textAlign: 'center', fontWeight: '700' }}>{getGrandAverage().toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* PÁGINA 2: Pareto 3 Semanas */}
          {selectedItems.threeWeeksChart && weeklyComparisonData && threeWeeksChartData && (
            <div style={pageStyle}>
              <div style={headerStyle}>
                <h1 style={titleStyle}>Pareto by station, start week, last week, current week - RR Line</h1>
                <p style={subtitleStyle}>
                  Start week - {weeklyComparisonData.startWeek.date} / 
                  Last week - {weeklyComparisonData.lastWeek.date} / 
                  Current week - {weeklyComparisonData.currentWeek.date}
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <BarChart width={900} height={450} data={threeWeeksChartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="startWeek" fill="#3B82F6" name="Start Week" />
                  <Bar dataKey="lastWeek" fill="#F97316" name="Last Week" />
                  <Bar dataKey="currentWeek" fill="#22C55E" name="Current Week" />
                </BarChart>
              </div>
            </div>
          )}

          {/* PÁGINA 3: Pareto 2 Semanas */}
          {selectedItems.twoWeeksChart && weeklyComparisonData && twoWeeksChartData && (
            <div style={pageStyle}>
              <div style={headerStyle}>
                <h1 style={titleStyle}>Pareto by station DPU week {weeklyComparisonData.currentWeek.date} - RR Line</h1>
                <p style={subtitleStyle}>Comparing: {weeklyComparisonData.lastWeek.date} vs {weeklyComparisonData.currentWeek.date}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <BarChart width={900} height={450} data={twoWeeksChartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="lastWeek" fill="#3B82F6" name={weeklyComparisonData.lastWeek.date} />
                  <Bar dataKey="currentWeek" fill="#F97316" name={weeklyComparisonData.currentWeek.date} />
                </BarChart>
              </div>
            </div>
          )}

          {/* PÁGINA 4: AVG DPU */}
          {selectedItems.avgDPUChart && avgDPUData && avgDPUData.length > 0 && (
            <div style={pageStyle}>
              <div style={headerStyle}>
                <h1 style={titleStyle}>AVG DPU RR - Annual Overview</h1>
                <p style={subtitleStyle}>Average DPU per week throughout the year</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <LineChart width={900} height={450} data={avgDPUData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" tick={{ fontSize: 8 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="avgDPU" stroke="#1e3a5f" strokeWidth={2} dot={{ r: 3 }} connectNulls={true} name="AVG DPU" />
                </LineChart>
              </div>
            </div>
          )}

          {/* PÁGINA 5: Total per Station */}
          {selectedItems.barChart && barChartData && barChartData.length > 0 && (
            <div style={pageStyle}>
              <div style={headerStyle}>
                <h1 style={titleStyle}>Total per Station - Current Week</h1>
                <p style={subtitleStyle}>Week Starting: {weekStarting}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <BarChart width={900} height={450} data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" fill="#3B82F6" name="Total Gigs" />
                </BarChart>
              </div>
            </div>
          )}

          {/* PÁGINA 6: Pie Chart */}
          {selectedItems.pieChart && pieChartData && pieChartData.length > 0 && (
            <div style={pageStyle}>
              <div style={headerStyle}>
                <h1 style={titleStyle}>Distribution by Truck</h1>
                <p style={subtitleStyle}>Week Starting: {weekStarting}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <PieChart width={900} height={450}>
                  <Pie
                    data={pieChartData}
                    cx={450}
                    cy={200}
                    outerRadius={150}
                    innerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    paddingAngle={5}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </div>
            </div>
          )}

          {/* PÁGINA 7: Stacked Bar */}
          {selectedItems.stackedBarChart && stackedBarData && stackedBarData.length > 0 && trucks && (
            <div style={pageStyle}>
              <div style={headerStyle}>
                <h1 style={titleStyle}>Comparison by Truck and Station</h1>
                <p style={subtitleStyle}>Week Starting: {weekStarting}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <BarChart width={900} height={450} data={stackedBarData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {trucks.filter(t => t.truckNumber).map((truck, idx) => (
                    <Bar 
                      key={truck.truckNumber} 
                      dataKey={`truck${idx}`} 
                      name={`${truck.day} truck (${truck.truckNumber})`}
                      fill={COLORS[idx % COLORS.length]} 
                      stackId="a"
                    />
                  ))}
                </BarChart>
              </div>
            </div>
          )}

          {/* PÁGINA 8: Area Chart */}
          {selectedItems.areaChart && areaChartData && areaChartData.length > 0 && (
            <div style={{...pageStyle, pageBreakAfter: 'auto'}}>
              <div style={headerStyle}>
                <h1 style={titleStyle}>Production Trend</h1>
                <p style={subtitleStyle}>Week Starting: {weekStarting}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <AreaChart width={900} height={450} data={areaChartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="value" stroke="#8B5CF6" fill="#C4B5FD" name="Production" />
                </AreaChart>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default PrintModal;
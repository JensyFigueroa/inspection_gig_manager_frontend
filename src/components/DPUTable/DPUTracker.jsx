import React, { useState, useEffect, useCallback } from 'react';
import '../DPUTable/DPUTracker.css';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { authAxios } from '../../App';
import ExcelJS from 'exceljs';
import LogoRev from '../../assets/logoRev.png'

const STATIONS = [
  'Station 1', 'Station 2', 'Station 3', 'Station 4', 'Station 5', 'Station 6',
  'Electrico T/S', 'Harness', 'Prep', 'Cab Shop', 'Body Shop', 'Paint'
];

const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#8B5CF6', '#EC4899'];

function DPUTracker() {
  const [activeTab, setActiveTab] = useState('tabla');
  const [weekStarting, setWeekStarting] = useState('');
  const [trucks, setTrucks] = useState([]);
  const [gigsByStation, setGigsByStation] = useState({});
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchDPUData = async (start = '', end = '') => {
  try {
    setLoading(true);
    
    const params = new URLSearchParams();
    if (start) params.append('startDate', start);
    if (end) params.append('endDate', end);
    
    const queryString = params.toString();
    const url = queryString 
      ? `gigs/dpu-tracker?${queryString}`
      : `gigs/dpu-tracker`;
    
    const response = await authAxios.get(url);
    const data = response.data;
    setWeekStarting(data.weekStarting || '');
    setTrucks(data.trucks || []);
    setGigsByStation(data.gigsByStation || {});
  } catch (err) {
    console.error('Error fetching DPU data:', err);
  } finally {
    setLoading(false);
  }
};


  // Load the date automatically
  // useEffect(() => {
  //   fetchDPUData();
  // }, [fetchDPUData]);

  const handleSearch = () => {
    // fetchDPUData(startDate, endDate);
    // Validar que ambas fechas estén seleccionadas
  if (!startDate || !endDate) {
    alert('Please select a start and end date');
    return;
  }
  fetchDPUData(startDate, endDate);
  };

  const handleClear = () => {
    setStartDate('');
  setEndDate('');
  setTrucks([]);
  setGigsByStation({});
  setWeekStarting('');
  };

  // Calculation functions
  const getStationTotal = (station) => {
    const stationData = gigsByStation[station] || {};
    return Object.values(stationData).reduce((sum, val) => sum + (val || 0), 0);
  };

  const getStationAverage = (station) => {
    const trucksWithData = trucks.filter(t => t.truckNumber).length;
    if (trucksWithData === 0) return 0;
    return getStationTotal(station) / trucksWithData;
  };

  const getColumnTotal = (truckNumber) => {
    if (!truckNumber) return 0;
    let total = 0;
    STATIONS.forEach(station => {
      total += (gigsByStation[station]?.[truckNumber] || 0);
    });
    return total;
  };

  const getGrandTotal = () => trucks.reduce((sum, truck) => sum + getColumnTotal(truck.truckNumber), 0);
  
  const getGrandAverage = () => {
    const trucksWithData = trucks.filter(t => t.truckNumber).length;
    return trucksWithData === 0 ? 0 : getGrandTotal() / trucksWithData;
  };

  const getGigCount = (station, truckNumber) => {
    if (!truckNumber) return '';
    return gigsByStation[station]?.[truckNumber] || 0;
  };

  const trucksWithData = trucks.filter(t => t.truckNumber).length;

  // Chart data
  const barChartData = STATIONS.map(station => ({
    name: station.length > 10 ? station.substring(0, 10) + '...' : station,
    fullName: station,
    total: getStationTotal(station)
  }));

  const pieChartData = trucks
    .filter(t => t.truckNumber)
    .map(truck => ({
      name: truck.truckNumber,
      value: getColumnTotal(truck.truckNumber)
    }));

  const stackedBarData = STATIONS.map(station => {
    const data = { name: station.length > 8 ? station.substring(0, 8) : station, fullName: station };
    trucks.filter(t => t.truckNumber).forEach((truck, idx) => {
      data[`truck${idx}`] = gigsByStation[station]?.[truck.truckNumber] || 0;
    });
    return data;
  });

  const areaChartData = STATIONS.map(station => ({
    name: station.length > 8 ? station.substring(0, 8) : station,
    fullName: station,
    value: getStationTotal(station)
  }));

  const top5Stations = [...STATIONS]
    .map(s => ({ name: s, total: getStationTotal(s), avg: getStationAverage(s) }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Export to Excel
const exportToExcel = async () => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('DPU Tracker');

  // Colores
  const headerBlue = 'B3D4FC';      // Azul claro del título
  const lightBlue = 'DBEAFE';       // Celeste claro filas pares
  const white = 'FFFFFF';           // Blanco filas impares
  const redColor = 'DC2626';        // Rojo para logo text

  // Configurar anchos de columna
worksheet.columns = [
  { width: 15 },    // A - Stations
  { width: 14 },    // B - DAYS/GIGS
  { width: 11.29 }, // C - Mon truck
  { width: 11.29 }, // D - Tue truck
  { width: 11.29 }, // E - Wed truck
  { width: 11.29 }, // F - Thur truck
  { width: 11.29 }, // G - TOTAL
  { width: 11.29 }, // H - AVERAGE
];

  // Fila 1: Título principal
  worksheet.mergeCells('A1:H1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'ROAD RESCUE PRODUCTION LINE DPU TRACKER';
  titleCell.font = { bold: true, size: 16, color: { argb: '1F2937' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerBlue } };
  worksheet.getRow(1).height = 35;

  // Fila 2: Week starting
  const row2 = ['Week starting', weekStarting, 'Mon truck', 'Tue truck', 'Wed truck', 'Thur truck', '', ''];
  worksheet.addRow(row2);
  worksheet.getRow(2).eachCell((cell, colNumber) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightBlue } };
    cell.border = getBorder();
    if (colNumber >= 7) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: white } };
    }
  });

  // Fila 3: Truck number
  const row3 = ['', 'Truck number', ...trucks.map(t => t.truckNumber || ''), '', ''];
  worksheet.addRow(row3);
  worksheet.getRow(3).eachCell((cell, colNumber) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightBlue } };
    cell.border = getBorder();
    cell.alignment = { horizontal: 'center' };
    if (colNumber >= 7) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: white } };
    }
  });

  // Fila 4: Customer
  const row4 = ['', 'Customer', ...trucks.map(t => t.customerName || ''), '', ''];
  worksheet.addRow(row4);
  worksheet.getRow(4).eachCell((cell, colNumber) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightBlue } };
    cell.border = getBorder();
    cell.alignment = { horizontal: 'center', wrapText: true };
    if (colNumber >= 7) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: white } };
    }
  });

  // Fila 5: Headers (Stations, DAYS, etc)
  const trucksCount = trucks.filter(t => t.truckNumber).length;
  const row5 = ['Stations', 'DAYS', trucksCount, '', '', '', 'TOTAL', 'AVERAGE'];
  worksheet.addRow(row5);
  worksheet.getRow(5).eachCell((cell, colNumber) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightBlue } };
    cell.border = getBorder();
    cell.font = { bold: true };
    if (colNumber >= 7) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: white } };
    }
  });

  // Agregar logo REV en celdas G2:H4
  worksheet.mergeCells('G2:H4');
  const logoCell = worksheet.getCell('G2');
  logoCell.value = 'REV\nVehicles for life';
  logoCell.font = { bold: true, size: 14 };
  logoCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  logoCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: white } };

  // Filas de datos (estaciones)
  const STATIONS = [
    'Station 1', 'Station 2', 'Station 3', 'Station 4', 'Station 5', 'Station 6',
    'Electrico T/S', 'Harness', 'Prep', 'Cab Shop', 'Body Shop', 'Paint'
  ];

  STATIONS.forEach((station, idx) => {
    const rowData = [
      station,
      idx === 0 ? 'GIGS' : '',
      ...trucks.map(t => t.truckNumber ? (gigsByStation[station]?.[t.truckNumber] || 0) : ''),
      getStationTotal(station),
      getStationAverage(station).toFixed(6)
    ];
    
    const row = worksheet.addRow(rowData);
    const bgColor = idx % 2 === 0 ? lightBlue : white;
    
    row.eachCell((cell, colNumber) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
      cell.border = getBorder();
      if (colNumber >= 3 && colNumber <= 8) {
        cell.alignment = { horizontal: 'right' };
      }
      // TOTAL y AVERAGE siempre fondo blanco
      if (colNumber >= 7) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: white } };
      }
    });
  });

  // Fila de totales
  const totalsRow = [
    '',
    'Total',
    ...trucks.map(t => getColumnTotal(t.truckNumber)),
    getGrandTotal(),
    getGrandAverage().toFixed(3)
  ];
  
  const totalRowExcel = worksheet.addRow(totalsRow);
  totalRowExcel.eachCell((cell, colNumber) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightBlue } };
    cell.border = getBorder();
    cell.font = { bold: true };
    if (colNumber >= 3) {
      cell.alignment = { horizontal: 'right' };
    }
  });

  // Agregar logo REV como imagen desde URL
// const logoImageId = workbook.addImage({
//   filename: LogoRev, // Ruta local al logo
//   extension: 'png',
// });

// worksheet.addImage(logoImageId, {
//   tl: { col: 6, row: 1 },
//   br: { col: 8, row: 4 },
// });

  // Generar y descargar archivo
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `DPU_Tracker_${new Date().toISOString().split('T')[0]}.xlsx`;
  a.click();
  window.URL.revokeObjectURL(url);
};

// Función helper para bordes
const getBorder = () => ({
  top: { style: 'thin', color: { argb: '9CA3AF' } },
  left: { style: 'thin', color: { argb: '9CA3AF' } },
  bottom: { style: 'thin', color: { argb: '9CA3AF' } },
  right: { style: 'thin', color: { argb: '9CA3AF' } }
});



  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <div className="logo-header">
            <div className="logo-cell w-10 h-10 bg-transparent">
              <img src="src/assets/logoRev.png" alt="" className='w-full h-full object-contain' />
            </div>
          </div>
          <h1 className="header-title">DPU TRACKER</h1>
        </div>
        <div className="header-right">
          <span className="filter-label">Filter:</span>
          <input
            type="date"
            className="date-input"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            placeholder="Start"
          />
          <span className="date-separator">-</span>
          <input
            type="date"
            className="date-input"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="End"
          />
          <button className="btn-search" onClick={handleSearch}>
            🔍 Search
          </button>
          <button className="btn-clear" onClick={handleClear}>
            Clean
          </button>
          <button className="btn-excel" onClick={exportToExcel}>
            ↓ Excel
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'tabla' ? 'active' : ''}`}
          onClick={() => setActiveTab('tabla')}
        >
          📊 Table
        </button>
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          📈 Chart
        </button>
      </div>

      {/* Content */}
      <div className="content-area ">
        {activeTab === 'tabla' ? (
          <div className="table-container" data-testid="table-container">
            {trucks.filter(t => t.truckNumber).length === 0 ? (
              <div className="empty-state">
                <p>Select a date range and click "Search" to view the data</p>
              </div>
            ) : (
            <div className="dpu-tracker">
              <div className="header-section">
                <h1 className="main-title">ROAD RESCUE PRODUCTION LINE DPU TRACKER</h1>
              </div>
              
              <table className="tracker-table ">
                <thead>
                  <tr className="info-row">
                    <td className="label-cell">Week starting</td>
                    <td className="date-cell">{weekStarting}</td>
                    <td className="day-header">Mon truck</td>
                    <td className="day-header">Tue truck</td>
                    <td className="day-header">Wed truck</td>
                    <td className="day-header">Thur truck</td>
                    
                    <td rowSpan="3" colSpan="2" className="logo-cell w-32 h-20">
                      <img src="src/assets/logoRev.png" alt="" className='w-full h-full object-contain'/>
                    </td>
                  </tr>
                  
                  <tr className="info-row">
                    <td className="label-cell"></td>
                    <td className="label-cell">Truck number</td>
                    {trucks.map((truck, idx) => (
                      <td key={`truck-${idx}`} className="truck-number">{truck.truckNumber}</td>
                    ))}
                  </tr>
                  
                  <tr className="info-row">
                    <td className="label-cell"></td>
                    <td className="label-cell">Customer</td>
                    {trucks.map((truck, idx) => (
                      <td key={`customer-${idx}`} className="customer-name">{truck.customerName}</td>
                    ))}
                  </tr>
                  
                  <tr className="header-row">
                    <td className="station-header">Stations</td>
                    <td className="gigs-header">DAYS</td>
                    <td className="days-count">{trucksWithData}</td>
                    <td className="empty-header"></td>
                    <td className="empty-header"></td>
                    <td className="empty-header"></td>
                    <td className="total-header">TOTAL</td>
                    <td className="average-header">AVERAGE</td>
                  </tr>
                </thead>
                
                <tbody>
                  {STATIONS.map((station, idx) => (
                    <tr key={station} className={idx % 2 === 0 ? 'row-even' : 'row-odd'}>
                      <td className="station-name">{station}</td>
                      <td className="gigs-label">{idx === 0 ? 'GIGS' : ''}</td>
                      {trucks.map((truck, tIdx) => (
                        <td key={`${station}-${tIdx}`} className="gig-count">
                          {getGigCount(station, truck.truckNumber)}
                        </td>
                      ))}
                      <td className="total-value">{getStationTotal(station)}</td>
                      <td className="average-value">{getStationAverage(station).toFixed(6)}</td>
                    </tr>
                  ))}
                  
                  <tr className="totals-row">
                    <td className="total-label"></td>
                    <td className="total-label-text">Total</td>
                    {trucks.map((truck, idx) => (
                      <td key={`col-total-${idx}`} className="column-total">
                        {getColumnTotal(truck.truckNumber)}
                      </td>
                    ))}
                    <td className="grand-total">{getGrandTotal()}</td>
                    <td className="grand-average">{getGrandAverage().toFixed(3)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            )}
          </div>
        ) : (
          <div className="dashboard-container">
            {/* Stats Cards */}
            {/* <div className="stats-cards">
              <div className="stat-card blue">
                <div className="stat-label">TOTAL PRODUCCIÓN</div>
                <div className="stat-value">📊 {getGrandTotal()}</div>
              </div>
              <div className="stat-card green">
                <div className="stat-label">PROMEDIO GENERAL</div>
                <div className="stat-value">📈 {getGrandAverage().toFixed(1)}</div>
              </div>
              <div className="stat-card orange">
                <div className="stat-label">CAMIONES</div>
                <div className="stat-value">🚛 {trucksWithData}</div>
              </div>
              <div className="stat-card purple">
                <div className="stat-label">ESTACIONES</div>
                <div className="stat-value">🏭 {STATIONS.length}</div>
              </div>
            </div> */}

            {/* Charts Grid */}
            <div className="charts-grid">
              <div className="chart-card">
                <h3 className="chart-title">📊 Total per station</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} dy={15}/>
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* <div className="chart-card">
                <h3 className="chart-title">🔵 Distribución por Camión</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
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

              <div className="chart-card">
                <h3 className="chart-title">📈 Comparativa por Camión y Estación</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stackedBarData}>
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
                </ResponsiveContainer>
              </div>

              <div className="chart-card">
                <h3 className="chart-title">📈 Tendencia de Producción</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={areaChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke="#8B5CF6" fill="#C4B5FD" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div> */}
            </div>

            {/* Top 5 Stations */}
            {/* <div className="top-stations">
              <h3 className="top-title">Top 5 Estaciones con Mayor Producción</h3>
              <div className="top-cards">
                {top5Stations.map((station, idx) => (
                  <div key={station.name} className="top-card">
                    <div className="top-rank" style={{ backgroundColor: COLORS[idx] }}>{idx + 1}</div>
                    <div className="top-name">{station.name}</div>
                    <div className="top-total">{station.total}</div>
                    <div className="top-avg">Promedio: {station.avg.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div> */}
          </div>
        )}
      </div>
    </div>
  );
}

export default DPUTracker;


import React from 'react';

const DpuTracker = () => {
  // Data structure for the stations
  const productionData = [
    { name: "Station 1", mon: 4, tue: 8, wed: 5, thur: 0 },
    { name: "Station 2", mon: 9, tue: 10, wed: 10, thur: 0 },
    { name: "Station 3", mon: 1, tue: 5, wed: 6, thur: 0 },
    { name: "Station 4", mon: 4, tue: 4, wed: 2, thur: 0 },
    { name: "Station 5", mon: 20, tue: 29, wed: 24, thur: 0 },
    { name: "Station 6", mon: 5, tue: 7, wed: 8, thur: 0 },
    { name: "Electrical T/S", mon: 0, tue: 0, wed: 0, thur: 0 },
    { name: "Harness", mon: 0, tue: 0, wed: 0, thur: 0 },
    { name: "Prep", mon: 1, tue: 1, wed: 1, thur: 0 },
    { name: "Cab Shop", mon: 13, tue: 7, wed: 5, thur: 0 },
    { name: "Body Shop", mon: 3, tue: 5, wed: 2, thur: 0 },
    { name: "Paint", mon: 0, tue: 5, wed: 4, thur: 0 },
  ];

  // Calculations
  const calculateRowTotal = (row) => row.mon + row.tue + row.wed + row.thur;
  const calculateRowAvg = (row) => (calculateRowTotal(row) / 3).toFixed(2); // Avg over 3 active trucks

  const columnTotals = {
    mon: productionData.reduce((acc, curr) => acc + curr.mon, 0),
    tue: productionData.reduce((acc, curr) => acc + curr.tue, 0),
    wed: productionData.reduce((acc, curr) => acc + curr.wed, 0),
    thur: productionData.reduce((acc, curr) => acc + curr.thur, 0),
  };

  const grandTotal = columnTotals.mon + columnTotals.tue + columnTotals.wed + columnTotals.thur;

  return (
    <div className="container mt-5">
      <div className="table-responsive shadow-sm">
        <table className="table table-bordered table-sm align-middle text-center">
          <thead className="table-light">
            {/* Main Header */}
            <tr>
              <th colSpan="7" className="py-3 h4 bg-primary text-white text-uppercase">
                Road Rescue Production Line DPU Tracker
              </th>
            </tr>
            {/* Truck Info Header */}
            <tr className="bg-light">
              <th className="text-start">Week starting</th>
              <th className="bg-white">2/9/2025</th>
              <th>Mon truck</th>
              <th>Tue truck</th>
              <th>Wed truck</th>
              <th>Thur truck</th>
              <th rowSpan="3" className="align-middle">
                <div style={{fontWeight: 'bold', color: '#d9534f'}}>REV</div>
                <small className="text-muted d-block" style={{fontSize: '10px'}}>Vehicles for Life</small>
              </th>
            </tr>
            <tr>
              <th className="text-start">Truck number</th>
              <td>DAYS: 3</td>
              <td className="bg-white">653028</td>
              <td className="bg-white">667298</td>
              <td className="bg-white">663868</td>
              <td className="bg-white">-</td>
            </tr>
            <tr>
              <th className="text-start">Customer</th>
              <td>GIGS</td>
              <td className="bg-white small">LSW EMERGENCY</td>
              <td className="bg-white small">BURNSVILLE FIRE</td>
              <td className="bg-white small">CENTRACARE</td>
              <td className="bg-white small">-</td>
            </tr>
            {/* Column Labels */}
            <tr className="table-secondary">
              <th className="text-start">STATIONS</th>
              <th></th>
              <th>DPUs</th>
              <th>DPUs</th>
              <th>DPUs</th>
              <th>DPUs</th>
              <th>TOTAL / AVG</th>
            </tr>
          </thead>
          <tbody>
            {productionData.map((row, index) => (
              <tr key={index}>
                <td className="text-start fw-bold table-light">{row.name}</td>
                <td></td>
                <td>{row.mon}</td>
                <td>{row.tue}</td>
                <td>{row.wed}</td>
                <td>{row.thur}</td>
                <td className="table-info">
                  <strong>{calculateRowTotal(row)}</strong> / <small>{calculateRowAvg(row)}</small>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="table-dark">
            <tr>
              <td className="text-end fw-bold" colSpan="2">Weekly Totals:</td>
              <td>{columnTotals.mon}</td>
              <td>{columnTotals.tue}</td>
              <td>{columnTotals.wed}</td>
              <td>{columnTotals.thur}</td>
              <td className="bg-warning text-dark fw-bold">
                {grandTotal} <small className="d-block text-muted" style={{fontSize: '10px'}}>TOTAL DPU</small>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default DpuTracker;
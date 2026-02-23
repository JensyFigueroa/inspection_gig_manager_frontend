import RevLogo from '../components/Logo/RevLogo';

// Función helper para nombre del día
const getDayName = (index) => {
  const days = ["Mon truck", "Tue truck", "Wed truck", "Thur truck", "Fri truck", "Sat truck", "Sun truck"];
  return days[index] || `Truck ${index + 1}`;
};

const DPUTable = ({ tracker, stationTotals, truckTotals, stationAverages, grandTotal, grandAverage }) => {
  // Colores para Tailwind (azul claro como en la imagen)
  const lightBlue = "bg-[#D4E6F1]";
  const headerBlue = "bg-[#AED6F1]";

  if (!tracker) {
    return (
      <div className="text-center py-10 text-gray-500">
        No hay datos para mostrar
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-gray-400 shadow-lg overflow-x-auto">
      <table className="w-full border-collapse text-sm" style={{ fontFamily: 'Arial, sans-serif' }}>
        <thead>
          {/* FILA 1: Título principal */}
          <tr className={headerBlue}>
            <td 
            //   colSpan={4 + tracker.trucks.length + 2} 
              className="py-3 text-center border border-gray-400"
            >
              <h1 className="text-2xl font-bold text-black">
                ROAD RESCUE PRODUCTION LINE DPU TRACKER
              </h1>
            </td>
          </tr>
          
          {/* FILA 2: Week starting + nombres de días */}
          <tr className="border border-gray-400">
            <td className={`py-2 px-3 border border-gray-400 font-medium ${lightBlue}`}>
              Week starting
            </td>
            <td className="py-2 px-3 border border-gray-400" colSpan={2}>
              {tracker.week_starting}
            </td>
            {tracker.trucks.map((_, idx) => (
              <td 
                key={idx} 
                className={`py-2 px-3 text-center border border-gray-400 font-medium ${lightBlue}`}
              >
                {getDayName(idx)}
              </td>
            ))}
            <td className="py-2 px-3 border border-gray-400 text-center" rowSpan={4}>
              <RevLogo />
            </td>
            <td className="py-2 px-3 border border-gray-400" rowSpan={4}></td>
          </tr>
          
          {/* FILA 3: Truck number */}
          <tr className="border border-gray-400">
            <td className={`py-2 px-3 border border-gray-400 ${lightBlue}`}></td>
            <td className="py-2 px-3 border border-gray-400 font-medium">Truck number</td>
            <td className="py-2 px-3 border border-gray-400"></td>
            {tracker.trucks.map((truck, idx) => (
              <td key={idx} className="py-2 px-3 text-center border border-gray-400 font-medium">
                {truck.truck_number}
              </td>
            ))}
          </tr>
          
          {/* FILA 4: Customer */}
          <tr className="border border-gray-400">
            <td className={`py-2 px-3 border border-gray-400 ${lightBlue}`}></td>
            <td className="py-2 px-3 border border-gray-400 font-medium">Customer</td>
            <td className="py-2 px-3 border border-gray-400"></td>
            {tracker.trucks.map((truck, idx) => (
              <td key={idx} className="py-1 px-2 text-center border border-gray-400 text-xs">
                {truck.customer}
              </td>
            ))}
          </tr>
          
          {/* FILA 5: Stations header con DAYS y TOTAL/AVERAGE */}
          <tr className={`${lightBlue} border border-gray-400`}>
            <td className="py-2 px-3 border border-gray-400 font-medium">Stations</td>
            <td className="py-2 px-3 text-center border border-gray-400 font-medium">DAYS</td>
            <td className="py-2 px-3 text-center border border-gray-400 font-medium">{tracker.days}</td>
            {tracker.trucks.map((_, idx) => (
              <td key={idx} className="py-2 px-3 border border-gray-400"></td>
            ))}
            <td className="py-2 px-3 text-center border border-gray-400 font-bold">TOTAL</td>
            <td className="py-2 px-3 text-center border border-gray-400 font-bold">AVERAGE</td>
          </tr>
        </thead>
        
        <tbody>
          {/* FILAS DE DATOS: Una fila por cada estación */}
          {tracker.stations.map((station, stationIdx) => (
            <tr 
              key={station} 
              className={`border border-gray-400 ${stationIdx % 2 === 0 ? lightBlue : 'bg-white'}`}
            >
              <td className="py-2 px-3 border border-gray-400 font-medium">
                {station}
              </td>
              <td className="py-2 px-3 text-center border border-gray-400">
                {stationIdx === 0 ? "GIGS" : ""}
              </td>
              <td className="py-2 px-3 border border-gray-400"></td>
              {tracker.trucks.map((truck, truckIdx) => (
                <td key={truckIdx} className="py-2 px-3 text-right border border-gray-400">
                  {truck.values[station] || 0}
                </td>
              ))}
              <td className="py-2 px-3 text-right border border-gray-400 font-medium">
                {stationTotals[station] || 0}
              </td>
              <td className="py-2 px-3 text-right border border-gray-400">
                {(stationAverages[station] || 0).toFixed(6)}
              </td>
            </tr>
          ))}
          
          {/* FILA TOTAL */}
          <tr className={`${headerBlue} border-2 border-gray-500 font-bold`}>
            <td className="py-2 px-3 border border-gray-400"></td>
            <td className="py-2 px-3 border border-gray-400"></td>
            <td className="py-2 px-3 text-right border border-gray-400 font-bold">Total</td>
            {truckTotals.map((total, idx) => (
              <td key={idx} className="py-2 px-3 text-right border border-gray-400 font-bold">
                {total}
              </td>
            ))}
            <td className="py-2 px-3 text-right border border-gray-400 font-bold">
              {grandTotal}
            </td>
            <td className="py-2 px-3 text-right border border-gray-400 font-bold">
              {grandAverage.toFixed(3)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default DPUTable;
import { ResponsivePieCanvas } from '@nivo/pie';
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from '@nivo/bar';
import styles from '../pages/statistics.module.css';
import Sidebar from '../components/Sidebar'

import RevLogo from "../components/Logo/RevLogo";
import DPUTable from "../components/DPUTable";
import DashboardCharts from "../components/DashboardCharts";

// Importar hook de cálculos
import { useDPUCalculations } from "../hooks/useDPUCalculations";

// Importar función de exportación
import { exportToExcel } from "../utils/exportExcel";
import axios from 'axios';
import { useEffect } from 'react';
import { useState } from 'react';
import { BarChart3, Download, RefreshCw, TrendingUp } from 'lucide-react';
import { authAxios } from '../App';

// ⚠️ CAMBIAR ESTO POR TU URL DE BACKEND
const API = "http://localhost:8001/api";

const Statistics = ({user}) => {

    // Estados
  const [tracker, setTracker] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("table"); // "table" o "dashboard"

  // Usar hook de cálculos
  const { 
    stationTotals, 
    truckTotals, 
    stationAverages, 
    grandTotal, 
    grandAverage 
  } = useDPUCalculations(tracker);

  // ==========================================
  // CARGAR DATOS AL INICIAR
  // ==========================================
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
            
        // Cargar datos
        
       const [gigsRes] = await Promise.all([
               authAxios.get('/gigs'),
             ]);
        
        console.log(gigsRes.data)
    
        // if (response.data && response.data.length > 0) {
        //   setTracker(response.data[0]);
        // }
      } catch (error) {
        console.error("Error cargando datos:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  console.log(tracker)

  // ==========================================
  // FUNCIÓN PARA EXPORTAR
  // ==========================================
  const handleExport = async () => {
    try {
      await exportToExcel(
        tracker, 
        stationTotals, 
        stationAverages, 
        truckTotals, 
        grandTotal, 
        grandAverage
      );
      alert("Excel exportado exitosamente!");
    } catch (error) {
      console.error("Error exportando:", error);
      alert("Error al exportar");
    }
  };

  // ==========================================
  // RENDER: LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-gray-600" />
        <span className="ml-3 text-gray-600 font-medium">Cargando datos...</span>
      </div>
    );
  }

  // ==========================================
  // RENDER: PRINCIPAL
  // ==========================================

  return (
    <div className={styles.appContainer}>
        <div className={styles.sidebar}>
            <Sidebar user={user}/>
        </div>

        <div className="flex-1 ml-54 p-8 lg:p-12 bg-gray-50 min-h-screen">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="font-heading font-black text-4xl uppercase tracking-tight text-slate-900 mb-2">
                            Statistics
                        </h1>
                    </div>
                </div>    


                <div className="min-h-screen bg-gray-100">
                  {/* HEADER */}
                  <header className="bg-white border-b border-gray-300 shadow-sm sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 py-3">
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        {/* Logo y título */}
                        <div className="flex items-center gap-4">
                          <RevLogo />
                          <div className="h-8 w-px bg-gray-300" />
                          <h1 className="text-lg font-bold text-gray-800">DPU TRACKER</h1>
                        </div>
                        
                        {/* Botón exportar */}
                        {tracker && (
                          <button
                            onClick={handleExport}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Exportar Excel
                          </button>
                        )}
                      </div>
                    </div>
                  </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 py-4">
        {tracker ? (
          <>
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab("table")}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${
                  activeTab === "table" 
                    ? "bg-blue-500 text-white" 
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Tabla
              </button>
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors ${
                  activeTab === "dashboard" 
                    ? "bg-blue-500 text-white" 
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Dashboard
              </button>
            </div>

            {/* CONTENIDO DEL TAB */}
            {activeTab === "table" ? (
              <DPUTable 
                tracker={tracker}
                stationTotals={stationTotals}
                truckTotals={truckTotals}
                stationAverages={stationAverages}
                grandTotal={grandTotal}
                grandAverage={grandAverage}
              />
            ) : (
              <DashboardCharts 
                tracker={tracker}
                stationTotals={stationTotals}
                truckTotals={truckTotals}
                stationAverages={stationAverages}
              />
            )}
          </>
        ) : (
          <div className="text-center py-20 text-gray-500">
            <p className="text-xl">No hay datos para mostrar</p>
            <p className="mt-2">Verifica la conexión con el backend</p>
          </div>
        )}
      </main>
    </div>    
     
        </div>

    </div>       

  )
}
export default Statistics
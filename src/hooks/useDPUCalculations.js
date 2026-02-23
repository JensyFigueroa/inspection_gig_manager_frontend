import { useCallback, useMemo } from 'react';

export const useDPUCalculations = (tracker) => {
  // Calcular total por estación
  const stationTotals = useMemo(() => {
    if (!tracker || !tracker.trucks) return {};
    const totals = {};
    tracker.stations.forEach(station => {
      totals[station] = tracker.trucks.reduce((sum, truck) => {
        return sum + (truck.values[station] || 0);
      }, 0);
    });
    return totals;
  }, [tracker]);

  // Calcular total por truck
  const truckTotals = useMemo(() => {
    if (!tracker || !tracker.trucks) return [];
    return tracker.trucks.map(truck => {
      return tracker.stations.reduce((sum, station) => {
        return sum + (truck.values[station] || 0);
      }, 0);
    });
  }, [tracker]);

  // Calcular promedio por estación
  const stationAverages = useMemo(() => {
    if (!tracker || !tracker.trucks || tracker.trucks.length === 0) return {};
    const averages = {};
    tracker.stations.forEach(station => {
      averages[station] = stationTotals[station] / tracker.trucks.length;
    });
    return averages;
  }, [tracker, stationTotals]);

  // Total general
  const grandTotal = useMemo(() => {
    return Object.values(stationTotals).reduce((sum, val) => sum + val, 0);
  }, [stationTotals]);

  // Promedio general
  const grandAverage = useMemo(() => {
    if (!tracker || !tracker.trucks || tracker.trucks.length === 0) return 0;
    return grandTotal / tracker.trucks.length;
  }, [grandTotal, tracker]);

  return {
    stationTotals,
    truckTotals,
    stationAverages,
    grandTotal,
    grandAverage
  };
};
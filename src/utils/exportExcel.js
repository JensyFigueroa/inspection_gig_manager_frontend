import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

// Función helper para nombre del día
const getDayName = (index) => {
  const days = ["Mon truck", "Tue truck", "Wed truck", "Thur truck", "Fri truck", "Sat truck", "Sun truck"];
  return days[index] || `Truck ${index + 1}`;
};

export const exportToExcel = async (tracker, stationTotals, stationAverages, truckTotals, grandTotal, grandAverage) => {
  if (!tracker) return;

  // Crear workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'DPU Tracker';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('DPU Tracker');

  // Definir colores (sin el #)
  const lightBlue = 'D4E6F1';
  const headerBlue = 'AED6F1';
  const white = 'FFFFFF';

  // Definir estilo de bordes
  const thinBorder = {
    top: { style: 'thin', color: { argb: '000000' } },
    left: { style: 'thin', color: { argb: '000000' } },
    bottom: { style: 'thin', color: { argb: '000000' } },
    right: { style: 'thin', color: { argb: '000000' } }
  };

  // Calcular total de columnas
  const totalColumns = 3 + tracker.trucks.length + 3;

  // FILA 1: TÍTULO
  worksheet.mergeCells(1, 1, 1, totalColumns);
  const titleCell = worksheet.getCell('A1');
  titleCell.value = 'ROAD RESCUE PRODUCTION LINE DPU TRACKER';
  titleCell.font = { bold: true, size: 16, name: 'Arial' };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerBlue } };
  titleCell.border = thinBorder;
  worksheet.getRow(1).height = 30;

  // FILA 2: WEEK STARTING + DÍAS
  worksheet.getCell('A2').value = 'Week starting';
  worksheet.getCell('A2').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightBlue } };
  worksheet.getCell('A2').font = { bold: true, name: 'Arial', size: 10 };
  worksheet.getCell('B2').value = tracker.week_starting;
  worksheet.mergeCells(2, 2, 2, 3);
  
  // Headers de días
  tracker.trucks.forEach((_, idx) => {
    const col = 4 + idx;
    const cell = worksheet.getCell(2, col);
    cell.value = getDayName(idx);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightBlue } };
    cell.font = { bold: true, name: 'Arial', size: 10 };
    cell.alignment = { horizontal: 'center' };
  });

  // Bordes fila 2
  for (let i = 1; i <= totalColumns; i++) {
    worksheet.getCell(2, i).border = thinBorder;
  }

  // FILA 3: TRUCK NUMBER
  worksheet.getCell('A3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightBlue } };
  worksheet.getCell('B3').value = 'Truck number';
  worksheet.getCell('B3').font = { bold: true, name: 'Arial', size: 10 };
  
  tracker.trucks.forEach((truck, idx) => {
    const cell = worksheet.getCell(3, 4 + idx);
    cell.value = truck.truck_number;
    cell.font = { bold: true, name: 'Arial', size: 10 };
    cell.alignment = { horizontal: 'center' };
  });

  for (let i = 1; i <= totalColumns; i++) {
    worksheet.getCell(3, i).border = thinBorder;
  }

  // FILA 4: CUSTOMER
  worksheet.getCell('A4').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightBlue } };
  worksheet.getCell('B4').value = 'Customer';
  worksheet.getCell('B4').font = { bold: true, name: 'Arial', size: 10 };
  
  tracker.trucks.forEach((truck, idx) => {
    const cell = worksheet.getCell(4, 4 + idx);
    cell.value = truck.customer;
    cell.font = { name: 'Arial', size: 9 };
    cell.alignment = { horizontal: 'center', wrapText: true };
  });

  for (let i = 1; i <= totalColumns; i++) {
    worksheet.getCell(4, i).border = thinBorder;
  }

  // FILA 5: STATIONS HEADER
  worksheet.getCell('A5').value = 'Stations';
  worksheet.getCell('A5').font = { bold: true, name: 'Arial', size: 10 };
  worksheet.getCell('B5').value = 'DAYS';
  worksheet.getCell('B5').font = { bold: true, name: 'Arial', size: 10 };
  worksheet.getCell('B5').alignment = { horizontal: 'center' };
  worksheet.getCell('C5').value = tracker.days;
  worksheet.getCell('C5').font = { bold: true, name: 'Arial', size: 10 };
  worksheet.getCell('C5').alignment = { horizontal: 'center' };

  // TOTAL y AVERAGE headers
  const totalCol = 4 + tracker.trucks.length + 1;
  const avgCol = totalCol + 1;
  worksheet.getCell(5, totalCol).value = 'TOTAL';
  worksheet.getCell(5, totalCol).font = { bold: true, name: 'Arial', size: 10 };
  worksheet.getCell(5, totalCol).alignment = { horizontal: 'center' };
  worksheet.getCell(5, avgCol).value = 'AVERAGE';
  worksheet.getCell(5, avgCol).font = { bold: true, name: 'Arial', size: 10 };
  worksheet.getCell(5, avgCol).alignment = { horizontal: 'center' };

  // Fondo azul fila 5
  for (let i = 1; i <= totalColumns; i++) {
    worksheet.getCell(5, i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightBlue } };
    worksheet.getCell(5, i).border = thinBorder;
  }

  // FILAS DE DATOS (ESTACIONES)
  tracker.stations.forEach((station, stationIdx) => {
    const rowNum = 6 + stationIdx;
    const isEvenRow = stationIdx % 2 === 0;
    const bgColor = isEvenRow ? lightBlue : white;

    // Nombre estación
    worksheet.getCell(rowNum, 1).value = station;
    worksheet.getCell(rowNum, 1).font = { bold: true, name: 'Arial', size: 10 };

    // GIGS solo en primera estación
    if (stationIdx === 0) {
      worksheet.getCell(rowNum, 2).value = 'GIGS';
      worksheet.getCell(rowNum, 2).alignment = { horizontal: 'center' };
    }

    // Valores de cada truck
    tracker.trucks.forEach((truck, truckIdx) => {
      const col = 4 + truckIdx;
      worksheet.getCell(rowNum, col).value = truck.values[station] || 0;
      worksheet.getCell(rowNum, col).alignment = { horizontal: 'right' };
      worksheet.getCell(rowNum, col).font = { name: 'Arial', size: 10 };
    });

    // Total estación
    worksheet.getCell(rowNum, totalCol).value = stationTotals[station] || 0;
    worksheet.getCell(rowNum, totalCol).font = { bold: true, name: 'Arial', size: 10 };
    worksheet.getCell(rowNum, totalCol).alignment = { horizontal: 'right' };

    // Promedio estación
    worksheet.getCell(rowNum, avgCol).value = Number((stationAverages[station] || 0).toFixed(6));
    worksheet.getCell(rowNum, avgCol).font = { name: 'Arial', size: 10 };
    worksheet.getCell(rowNum, avgCol).alignment = { horizontal: 'right' };

    // Aplicar fondo y bordes
    for (let i = 1; i <= totalColumns; i++) {
      worksheet.getCell(rowNum, i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgColor } };
      worksheet.getCell(rowNum, i).border = thinBorder;
    }
  });

  // FILA TOTAL
  const totalRowNum = 6 + tracker.stations.length;
  worksheet.getCell(totalRowNum, 3).value = 'Total';
  worksheet.getCell(totalRowNum, 3).font = { bold: true, name: 'Arial', size: 10 };
  worksheet.getCell(totalRowNum, 3).alignment = { horizontal: 'right' };

  tracker.trucks.forEach((_, truckIdx) => {
    const col = 4 + truckIdx;
    worksheet.getCell(totalRowNum, col).value = truckTotals[truckIdx];
    worksheet.getCell(totalRowNum, col).font = { bold: true, name: 'Arial', size: 10 };
    worksheet.getCell(totalRowNum, col).alignment = { horizontal: 'right' };
  });

  worksheet.getCell(totalRowNum, totalCol).value = grandTotal;
  worksheet.getCell(totalRowNum, totalCol).font = { bold: true, name: 'Arial', size: 10 };
  worksheet.getCell(totalRowNum, totalCol).alignment = { horizontal: 'right' };

  worksheet.getCell(totalRowNum, avgCol).value = Number(grandAverage.toFixed(3));
  worksheet.getCell(totalRowNum, avgCol).font = { bold: true, name: 'Arial', size: 10 };
  worksheet.getCell(totalRowNum, avgCol).alignment = { horizontal: 'right' };

  // Fondo azul oscuro fila total
  for (let i = 1; i <= totalColumns; i++) {
    worksheet.getCell(totalRowNum, i).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: headerBlue } };
    worksheet.getCell(totalRowNum, i).border = thinBorder;
  }

  // ANCHOS DE COLUMNA
  worksheet.getColumn(1).width = 14;
  worksheet.getColumn(2).width = 14;
  worksheet.getColumn(3).width = 8;
  tracker.trucks.forEach((_, idx) => {
    worksheet.getColumn(4 + idx).width = 16;
  });
  worksheet.getColumn(totalCol).width = 10;
  worksheet.getColumn(avgCol).width = 12;

  // GENERAR Y DESCARGAR
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  saveAs(blob, `DPU_Tracker_${tracker.week_starting}.xlsx`);
  
  return true;
};
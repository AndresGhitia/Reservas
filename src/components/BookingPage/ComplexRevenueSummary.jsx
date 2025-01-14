import React from 'react';
import { getWeek, getMonth, getYear, isSameDay,isSameWeek,isSameMonth, isSameYear  } from 'date-fns';
import Charts from './Charts'

const ComplexRevenueSummary = ({ spaces }) => {

  const calculateRevenue = () => {
    const today = new Date();
    const totals = {
      today: 0,
      week: 0,
      month: 0,
      year: 0,
    };
  
    spaces.forEach((space) => {
      const isPaddle = space.sport === 'Paddle'; // Verificar si es cancha de Paddle
  
      // Recorrer las reservas por cada espacio y calcular el total
      Object.entries(space.reservationsByDay).forEach(([date, count]) => {
        const reservationDate = new Date(date);
  
        if (isNaN(reservationDate)) {
          console.warn(`La fecha "${date}" no es válida y no se incluirá.`);
          return;
        }
  
        const adjustedCount = isPaddle ? count / 2 : count; // Fraccionar si es Paddle
  
        // Calcular totales
        if (isSameDay(reservationDate, today)) {
          totals.today += adjustedCount;
        }
  
        if (getWeek(reservationDate) === getWeek(today)) {
          totals.week += adjustedCount;
        }
  
        if (getMonth(reservationDate) === getMonth(today)) {
          totals.month += adjustedCount;
        }
  
        if (getYear(reservationDate) === getYear(today)) {
          totals.year += adjustedCount;
        }
      });
    });
  
    return totals;
  };

  const formatHours = (decimalHours) => {
    const hours = Math.floor(decimalHours); // Parte entera de las horas
    const minutes = Math.round((decimalHours - hours) * 60); // Parte decimal convertida a minutos
    return `${hours}:${minutes.toString().padStart(2, '0')} horas`; // Formato HH:MM horas
  };

  const totals = calculateRevenue();

  return (
    <div
      style={{
        marginTop: '20px',
        padding: '16px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9',
      }}
    >
      {/* <h3>Resumen Total</h3> */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between', // Distribuir en columnas
          gap: '10px',
        }}
      >
      </div>
      <Charts spaces={spaces} />

    </div>
  );
};

export default ComplexRevenueSummary;

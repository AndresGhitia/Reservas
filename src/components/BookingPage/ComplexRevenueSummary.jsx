import React from 'react';
import { getWeek, getMonth, getYear } from 'date-fns';

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
        const adjustedCount = isPaddle ? count / 2 : count; // Fraccionar si es Paddle

        if (reservationDate.toDateString() === today.toDateString()) {
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
      <h3>Resumen Total</h3>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between', // Distribuir en columnas
          gap: '10px',
        }}
      >
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h4>Hoy:</h4>
          <p>{formatHours(totals.today)}</p>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h4>Esta Semana:</h4>
          <p>{formatHours(totals.week)}</p>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h4>Este Mes:</h4>
          <p>{formatHours(totals.month)}</p>
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h4>Este Año:</h4>
          <p>{formatHours(totals.year)}</p>
        </div>
      </div>
    </div>
  );
};

export default ComplexRevenueSummary;

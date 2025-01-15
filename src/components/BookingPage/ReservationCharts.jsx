import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { isSameDay, isSameWeek, isSameMonth, isSameYear } from 'date-fns';
import './ReservationCharts.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const ReservationCharts = ({ spaces }) => {
  const calculateRevenueByPeriod = () => {
    const today = new Date();
    const periods = {
      day: {},
      week: {},
      month: {},
      year: {},
    };

    spaces.forEach((space) => {
      const isPaddle = space.sport === 'Paddle';

      if (!space.reservationsByDay || Object.keys(space.reservationsByDay).length === 0) {
        return;
      }

      Object.entries(space.reservationsByDay).forEach(([date, count]) => {
        const reservationDate = new Date(`${date}T00:00:00`);

        if (isNaN(reservationDate)) {
          return;
        }

        const adjustedCount = isPaddle ? count / 2 : count;

        // Ingresos por día
        if (isSameDay(reservationDate, today)) {
          periods.day[space.name] = (periods.day[space.name] || 0) + adjustedCount;
        }

        // Ingresos por semana
        if (isSameWeek(reservationDate, today)) {
          periods.week[space.name] = (periods.week[space.name] || 0) + adjustedCount;
        }

        // Ingresos por mes
        if (isSameMonth(reservationDate, today)) {
          periods.month[space.name] = (periods.month[space.name] || 0) + adjustedCount;
        }

        // Ingresos por año
        if (isSameYear(reservationDate, today)) {
          periods.year[space.name] = (periods.year[space.name] || 0) + adjustedCount;
        }
      });
    });

    return periods;
  };

  const revenueByPeriod = calculateRevenueByPeriod();

  const prepareChartData = (data) => {
    const labels = Object.keys(data); // Nombres de las canchas
    const values = Object.values(data);
    const colors = labels.map(
      (_, i) => `hsl(${(i * 360) / labels.length}, 60%, 50%)` // Colores dinámicos
    );

    return {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: colors,
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      tooltip: {
        callbacks: {
         
          label: function(tooltipItem) {
            const value = tooltipItem.raw; 
            const total = tooltipItem.chart.data.datasets[0].data.reduce((a, b) => a + b, 0); 
            const percentage = ((value / total) * 100).toFixed(2); 
  
         
            const adjustedValue = value; 
            const totalHours = adjustedValue.toFixed(2); 
            const totalMinutes = Math.round((totalHours - Math.floor(totalHours)) * 60); 
            const formattedHours = `${Math.floor(totalHours)}:${totalMinutes.toString().padStart(2, '0')}`;
  
            return `${formattedHours} (${percentage}%)`; 
          },
        },
      },
    },
  };

  const calculateTotalRevenue = (periodData) => {
    return Object.values(periodData).reduce((total, currentValue) => total + currentValue, 0);
  };

  const formatHours = (decimalHours) => {
    const hours = Math.floor(decimalHours); // Parte entera de las horas
    const minutes = Math.round((decimalHours - hours) * 60); // Parte decimal convertida a minutos
    return `${hours}:${minutes.toString().padStart(2, '0')}HS`; // Formato HH:MMHS
  };

  return (
    <div className='charts-page-container'>
      <h1>Gráficos de Ocupación</h1>

      <div className="charts-container">
        {['day', 'week', 'month', 'year'].map((period) => (
          <div key={period} className="chart-item">
            <h4>
              {period === 'day'
                ? 'Hoy'
                : period === 'week'
                ? 'Esta Semana'
                : period === 'month'
                ? 'Este Mes'
                : 'Este Año'}
            </h4>
            <p>
            Hora reservadas: {formatHours(calculateTotalRevenue(revenueByPeriod[period]))}
            </p>
            {Object.keys(revenueByPeriod[period]).length > 0 ? (
              <Pie
                data={prepareChartData(revenueByPeriod[period])}
                options={chartOptions}
              />
            ) : (
              <p>No hay datos disponibles</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReservationCharts;

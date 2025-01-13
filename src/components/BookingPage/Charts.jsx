import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { getWeek, getMonth, getYear } from 'date-fns';
import './Charts.css'; // Importamos el CSS

ChartJS.register(ArcElement, Tooltip, Legend);

const Charts = ({ spaces }) => {
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

      Object.entries(space.reservationsByDay).forEach(([date, count]) => {
        const reservationDate = new Date(date);
        const adjustedCount = isPaddle ? count / 2 : count;

        // Ingresos por día
        if (reservationDate.toDateString() === today.toDateString()) {
          periods.day[space.name] = (periods.day[space.name] || 0) + adjustedCount;
        }

        // Ingresos por semana
        if (getWeek(reservationDate) === getWeek(today)) {
          periods.week[space.name] = (periods.week[space.name] || 0) + adjustedCount;
        }

        // Ingresos por mes
        if (getMonth(reservationDate) === getMonth(today)) {
          periods.month[space.name] = (periods.month[space.name] || 0) + adjustedCount;
        }

        // Ingresos por año
        if (getYear(reservationDate) === getYear(today)) {
          periods.year[space.name] = (periods.year[space.name] || 0) + adjustedCount;
        }
      });
    });

    return periods;
  };

  const revenueByPeriod = calculateRevenueByPeriod();

  const prepareChartData = (data) => {
    const labels = Object.keys(data); // Nombres de las canchas
    const values = Object.values(data); // Ingresos de las canchas
    const colors = labels.map(
      (_, i) => `hsl(${(i * 360) / labels.length}, 70%, 50%)` // Colores dinámicos
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
    },
  };

  return (
    <div>
      {/* <h3>Gráficos de Ingresos por Periodo</h3> */}
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
            <Pie
              data={prepareChartData(revenueByPeriod[period])}
              options={chartOptions}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Charts;


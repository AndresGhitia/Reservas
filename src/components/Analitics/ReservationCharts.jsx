import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { calculateByPeriod, calculateHours, formatHours } from './ChartsFunction';
import './ReservationCharts.css';

ChartJS.register(ArcElement, Tooltip, Legend);

const ReservationCharts = ({ spaces }) => {
  const reservationsByPeriod = calculateByPeriod(spaces, calculateHours);

  const prepareChartData = (data) => {
    const labels = Object.keys(data);
    const values = Object.values(data);
    const colors = labels.map((_, i) => `hsl(${(i * 360) / labels.length}, 60%, 50%)`);

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
      legend: { position: 'bottom' },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const value = tooltipItem.raw;
            const total = tooltipItem.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(2);
            return `${formatHours(value)} (${percentage}%)`;
          },
        },
      },
    },
  };

  const calculateTotalHours = (periodData) => {
    return Object.values(periodData).reduce((total, currentValue) => total + currentValue, 0);
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
                ? 'Ultimos 7 dias'
                : period === 'month'
                ? 'Este Mes'
                : 'Este Año'}
            </h4>
            <p>Horas reservadas: {formatHours(calculateTotalHours(reservationsByPeriod[period]))}</p>
            {Object.keys(reservationsByPeriod[period]).length > 0 ? (
              <Pie data={prepareChartData(reservationsByPeriod[period])} options={chartOptions} />
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

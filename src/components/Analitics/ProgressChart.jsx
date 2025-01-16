import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';
import { calculateLast12Months, calculateEarnings } from './ChartsFunction';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const ProgressChart = ({ spaces }) => {
  const last12MonthsEarnings = calculateLast12Months(spaces, calculateEarnings);

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  const currentMonth = new Date().getMonth();
  const last12Months = Array.from({ length: 12 }, (_, i) =>
    months[(currentMonth - 11 + i + 12) % 12]
  );

  const data = {
    labels: last12Months,
    datasets: [
      {
        label: 'Ingresos ($)',
        data: last12MonthsEarnings,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointBorderColor: '#fff',
        borderWidth: 2,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: (context) => `$ ${context.raw.toLocaleString()}`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        grid: {
          color: 'rgba(200, 200, 200, 0.2)',
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ height: '400px', width: '100%' }}>
         <h1>Gráficos de Progreso</h1>

      <Line data={data} options={options} />
    </div>
  );
};

export default ProgressChart;



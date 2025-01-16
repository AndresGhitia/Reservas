import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { calculateByPeriod, calculateEarnings } from './ChartsFunction';
import './IncomeCharts.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const IncomeCharts = ({ spaces }) => {
  const incomeByPeriod = calculateByPeriod(spaces, calculateEarnings);

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
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const value = tooltipItem.raw;
            const total = tooltipItem.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(2);
            return `$${value.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: '',
        },
        ticks: {
          callback: function (value, index, values) {
            const label = this.getLabelForValue(value);
            return label.length > 10 ? label.replace(/(.{10})/g, '$1\n') : label; // Dividir en líneas si es necesario
          },
          font: {
            size: 14, // Aumentar el tamaño de la fuente
          },
        },
      },
      y: {
        title: {
          display: true,
          text: 'Ingresos ($)',
        },
        beginAtZero: true,
        ticks: {
          font: {
            size: 14, // Aumentar el tamaño de la fuente
          },
        },
      },
    },
  };

  const calculateTotalIncome = (periodData) => {
    return Object.values(periodData).reduce((total, currentValue) => total + currentValue, 0);
  };

  return (
    <div className='income-charts-page-container'>
      <h1>Gráficos de Ingresos</h1>

      <div className="income-charts-container">
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
            <p>Total ingresos: ${calculateTotalIncome(incomeByPeriod[period]).toFixed(2)}</p>
            {Object.keys(incomeByPeriod[period]).length > 0 ? (
              <Bar 
                data={prepareChartData(incomeByPeriod[period])} 
                options={{
                  ...chartOptions,
                  maintainAspectRatio: false, // Para ajustar el tamaño
                }} 
                height={300} // Aumentar altura del gráfico
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

export default IncomeCharts;

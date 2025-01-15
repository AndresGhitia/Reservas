import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { isSameMonth, isSameYear } from 'date-fns';
import './IncomeCharts.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const IncomeCharts = ({ spaces }) => {

 const calculateRevenueByPeriod = () => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // Mes actual (1-12)
  const currentYear = today.getFullYear(); // Año actual
  const periods = {
    day: [],
    week: [],
    month: [],
    year: [],
  };

  if (!spaces || !Array.isArray(spaces) || spaces.length === 0) {
    return periods;
  }

  spaces.forEach((space) => {
    if (!space.reservationsByDay || Object.keys(space.reservationsByDay).length === 0) {
      return;
    }

    const isPaddle = space.sport === 'Paddle';

    Object.entries(space.reservationsByDay).forEach(([dateKey, count]) => {
      if (count <= 0) return; // Ignorar reservas no positivas

      // Analizar manualmente la fecha para evitar problemas con el constructor Date
      const [year, month, day] = dateKey.split('-').map(Number);
      if (!year || !month || !day) return; // Validación básica de la fecha

      const reservationDate = new Date(year, month - 1, day);

      // Debugging: Verificar fechas procesadas
      console.log('Procesando fecha:', { dateKey, year, month, day, count });

      if (isNaN(reservationDate)) {
        console.error('Fecha inválida:', dateKey);
        return;
      }

      const adjustedCount = isPaddle ? count / 2 : count;
      const earnings = adjustedCount * space.rate;

      // Comparación para "Hoy"
      if (isSameDay(reservationDate, today)) {
        periods.day.push({ name: space.name, earnings });
      }

      // Comparación para "Semana"
      if (isInLast7Days(reservationDate, today)) {
        periods.week.push({ name: space.name, earnings });
      }

      // Comparación para "Este Mes"
      if (month === currentMonth && year === currentYear) {
        periods.month.push({ name: space.name, earnings });
      }

      // Comparación para "Este Año"
      if (year === currentYear) {
        periods.year.push({ name: space.name, earnings });
      }
    });
  });

  return periods;
};


  const isInLast7Days = (date, today) => {
    const diff = Math.ceil((today - date) / (1000 * 60 * 60 * 24)); // Diferencia en días
    return diff >= 0 && diff < 7;
  };

  const isSameDay = (d1, d2) => {
    return (
      d1.getDate() === d2.getDate() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getFullYear() === d2.getFullYear()
    );
  };

  const revenueByPeriod = calculateRevenueByPeriod();

  const prepareChartData = (data) => {
    const labels = Array.from(new Set(data.map((item) => item.name)));
    const values = labels.map((name) =>
      data.filter((item) => item.name === name).reduce((sum, item) => sum + item.earnings, 0)
    );

    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

    return {
      labels,
      datasets: [
        {
          label: 'Ganancias',
          data: values,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length),
          borderWidth: 1,
        },
      ],
    };
  };

  const chartOptions = (totalEarnings) => ({
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Total Ganancias: ${totalEarnings.toLocaleString('es-AR', {
          style: 'currency',
          currency: 'ARS',
        })}`,
        align: 'center',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const value = tooltipItem.raw;
            return `Ganancia: ${value.toLocaleString('es-AR', {
              style: 'currency',
              currency: 'ARS',
            })}`;
          },
        },
      },
    },
  });

  return (
    <div className="income-charts-page-container">
      <h1>Gráficos de Ganancias</h1>
      <div className="income-charts-container">
        {['day', 'week', 'month', 'year'].map((period) => (
          <div key={period} className="income-chart-item">
            <h4>
              {period === 'day'
                ? 'Hoy'
                : period === 'week'
                ? 'Últimos 7 Días'
                : period === 'month'
                ? 'Este Mes'
                : 'Este Año'}
            </h4>
            <div style={{ height: '300px', width: '400px' }}>
              {revenueByPeriod[period].length > 0 ? (
                <Bar
                  data={prepareChartData(revenueByPeriod[period])}
                  options={chartOptions(
                    revenueByPeriod[period].reduce(
                      (sum, item) => sum + item.earnings,
                      0
                    )
                  )}
                />
              ) : (
                <p>No hay datos disponibles</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncomeCharts;

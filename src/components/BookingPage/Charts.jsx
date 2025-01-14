import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { isSameDay,isSameWeek,isSameMonth, isSameYear  } from 'date-fns';
import './Charts.css';

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
  
    // console.log("Calculando ingresos por períodos...");
    // console.log("Fecha de hoy:", today.toDateString());
  
    spaces.forEach((space) => {
      const isPaddle = space.sport === 'Paddle';
  
      if (!space.reservationsByDay || Object.keys(space.reservationsByDay).length === 0) {
        // console.log(`Sin reservas para el espacio "${space.name}".`);
        return;
      }
  
      // console.log(`Espacio: ${space.name}, Deporte: ${space.sport}`);
  
      Object.entries(space.reservationsByDay).forEach(([date, count]) => {
        const reservationDate = new Date(`${date}T00:00:00`); // Asegura que la hora sea la misma
  
        if (isNaN(reservationDate)) {
          // console.warn(`Fecha inválida encontrada: ${date}`);
          return;
        }
  
        const adjustedCount = isPaddle ? count / 2 : count;
  
        // console.log(`Fecha original: ${date}, Fecha convertida: ${reservationDate.toString()}, Reservas: ${count}, Ajustado: ${adjustedCount}`);
  
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
  
    // console.log('Resultados finales por período:', periods);
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
    <div className='charts-page-container'>
    
    <h1>Graficos de ocupacion</h1>

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

export default Charts;

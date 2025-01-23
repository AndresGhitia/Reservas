import { isSameDay, isSameMonth, isSameYear } from 'date-fns';

// Función genérica para calcular ingresos o reservas por periodo
export const calculateByPeriod = (spaces, calculateValue) => {
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7); // Fecha de hace 7 días

  const periods = {
    day: {},
    week: {}, // Últimos 7 días
    month: {},
    year: {},
  };

  if (!spaces || !Array.isArray(spaces) || spaces.length === 0) {
    return periods;
  }

  spaces.forEach((space) => {
    if (!space.reservationsByDay || Object.keys(space.reservationsByDay).length === 0) {
      return;
    }

    Object.entries(space.reservationsByDay).forEach(([date, count]) => {
      const reservationDate = new Date(`${date}T00:00:00`);

      if (isNaN(reservationDate)) {
        return;
      }

      const value = calculateValue(space, count);

      // Día
      if (isSameDay(reservationDate, today)) {
        periods.day[space.name] = (periods.day[space.name] || 0) + value;
      }

      // Últimos 7 días
      if (reservationDate >= sevenDaysAgo && reservationDate <= today) {
        console.log(`Fecha de reserva: ${reservationDate.toISOString().split('T')[0]}`);
        periods.week[space.name] = (periods.week[space.name] || 0) + value;
      }

      // Mes
      if (isSameMonth(reservationDate, today)) {
        periods.month[space.name] = (periods.month[space.name] || 0) + value;
      }

      // Año
      if (isSameYear(reservationDate, today)) {
        periods.year[space.name] = (periods.year[space.name] || 0) + value;
      }
    });
  });

  return periods;
};


// Función para calcular ingresos
export const calculateEarnings = (space, count) => {
  const isPaddle = space.sport === 'Paddle';
  const adjustedCount = isPaddle ? count / 2 : count;
  return adjustedCount * space.rate;
};

// Función para calcular horas reservadas
export const calculateHours = (space, count) => {
  const isPaddle = space.sport === 'Paddle';
  return isPaddle ? count / 2 : count;
};

// Formatear horas en formato HH:MMHS
export const formatHours = (decimalHours) => {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours}:${minutes.toString().padStart(2, '0')}HS`;
};

// Función para calcular ingresos de los últimos 12 meses
export const calculateLast12Months = (spaces, calculateValue) => {
  const today = new Date();
  const monthsData = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    return {
      month: date.getMonth(),
      year: date.getFullYear(),
      total: 0,
    };
  }).reverse(); // Ordenar de más antiguo a más reciente

  if (!spaces || !Array.isArray(spaces) || spaces.length === 0) {
    return monthsData.map(({ total }) => total);
  }

  spaces.forEach((space) => {
    if (!space.reservationsByDay || Object.keys(space.reservationsByDay).length === 0) {
      return;
    }

    Object.entries(space.reservationsByDay).forEach(([date, count]) => {
      const reservationDate = new Date(`${date}T00:00:00`);

      if (isNaN(reservationDate)) {
        return;
      }

      const value = calculateValue(space, count);

      monthsData.forEach((monthData) => {
        if (
          reservationDate.getFullYear() === monthData.year &&
          reservationDate.getMonth() === monthData.month
        ) {
          monthData.total += value;
        }
      });
    });
  });

  return monthsData.map(({ total }) => total);
};

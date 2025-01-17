import React from 'react';
import { Modal, Box, Button, Typography } from '@mui/material';
import './SpaceDetailsModal.css';

const SpaceDetailsModal = ({ open, onClose, space }) => {
  if (!space) return null;

  const isPaddle = space.sport === 'Paddle';

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const sumDailyReservations = (reservations) => {
    return Object.values(reservations).reduce((acc, val) => acc + val, 0);
  };

  const sumMonthlyReservations = (reservations) => {
    return Object.values(reservations).reduce((acc, val) => acc + val, 0);
  };

  const renderMonthlyReservations = (reservations) => {
    const currentYear = new Date().getFullYear();
  
    const formattedReservations = Object.entries(reservations)
      .filter(([monthKey, value]) => value > 0) // Ignorar valores no positivos
      .reduce((acc, [monthKey, value]) => {
        const [year, month] = monthKey.split('-'); // Supone formato "YYYY-MM"
        if (parseInt(year, 10) === currentYear) {
          const monthIndex = parseInt(month, 10) - 1; // Convertir mes a índice (0-11)
          const date = new Date(currentYear, monthIndex); // Año actual
          const monthName = date.toLocaleString('es-ES', { month: 'long' }).toUpperCase();
          const adjustedHours = isPaddle ? value / 2 : value; // Ajustar horas si es Paddle
          const earnings = adjustedHours * space.rate; // Calcular ganancia
  
          acc[monthName] = { hours: adjustedHours, earnings };
        }
        return acc;
      }, {});
  
    return (
      <div style={{ marginBottom: '16px' }}>
        <h4>Reservas del año {currentYear}</h4>
        <div className="reservation-table">
          <div className="table-header">
            <div className="table-cell">Fecha</div>
            <div className="table-cell">Reservas</div>
            <div className="table-cell">Ganancia</div>
          </div>
          <div
            style={{
              maxHeight: '200px',
              overflowY: 'auto',
              border: '1px solid #ddd',
            }}
          >
            {Object.entries(formattedReservations).map(([monthName, { hours, earnings }]) => (
              <div key={monthName} className="table-row">
                <div className="table-cell">{monthName}</div>
                <div className="table-cell">
                  {hours} {hours === 1 ? 'Hora' : 'Horas'}
                </div>
                <div className="table-cell">{formatCurrency(earnings)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };
  

  const renderDailyReservations = (reservations) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // Mes actual (1-12)
    const currentYear = currentDate.getFullYear(); // Año actual
    const monthName = currentDate.toLocaleString('es-ES', { month: 'long' }); // Nombre del mes en español
  
    // Filtrar reservas del mes y año actual
    const filteredReservations = Object.entries(reservations)
      .filter(([key, value]) => {
        if (value <= 0) return false; // Ignorar reservas no positivas
  
        const [year, month] = key.split('-').map(Number);
        return month === currentMonth && year === currentYear;
      })
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB)); // Ordenar por fecha ascendente
  
    return (
      <div style={{ marginBottom: '16px' }}>
        {/* Encabezado dinámico con el mes actual */}
        <h4>Reservas por día ({monthName.charAt(0).toUpperCase() + monthName.slice(1)})</h4>
        <div className="reservation-table">
          <div className="table-header">
            <div className="table-cell">Fecha</div>
            <div className="table-cell">Reservas</div>
            <div className="table-cell">Ganancia</div>
          </div>
          <div
            style={{
              maxHeight: '200px',
              overflowY: 'auto',
              border: '1px solid #ddd',
            }}
          >
            {filteredReservations.map(([key, value]) => {
              const adjustedHours = isPaddle ? value / 2 : value; // Ajuste para Paddle
              const earnings = adjustedHours * space.rate; // Ganancias calculadas
  
              // Formatear la fecha al estilo "día-mes"
              const [, month, day] = key.split('-').map(Number);
  
              return (
                <div key={key} className="table-row">
                  <div className="table-cell">{`${day}-${month}`}</div>
                  <div className="table-cell">
                    {adjustedHours} {adjustedHours === 1 ? 'Hora' : 'Horas'}
                  </div>
                  <div className="table-cell">{formatCurrency(earnings)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };
  
  
  // Depuración: Comparar reservas diarias y mensuales
  const dailyTotal = sumDailyReservations(space.reservationsByDay);
  const monthlyTotal = sumMonthlyReservations(space.reservationsByMonth);

  console.log("Total horas diarias (ajustadas):", isPaddle ? dailyTotal / 2 : dailyTotal);
  console.log("Total horas mensuales (ajustadas):", isPaddle ? monthlyTotal / 2 : monthlyTotal);

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="space-details-modal"
      aria-describedby="space-details-description"
    >
      <Box className="modal-container">
        <Typography variant="h6" component="h2" gutterBottom>
          Rendimiento de la Cancha: {space.name}
        </Typography>

        {renderDailyReservations(space.reservationsByDay)}

        {renderMonthlyReservations(space.reservationsByMonth)}

        <Button onClick={onClose} variant="contained" color="primary" sx={{ marginTop: 2 }}>
          Cerrar
        </Button>
      </Box>
    </Modal>
  );
};

export default SpaceDetailsModal;

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
        <h4>Reservas por mes</h4>
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
    const currentMonth = new Date().getMonth() + 1;

    const filteredReservations = Object.entries(reservations)
      .filter(([key, value]) => {
        if (value <= 0) return false;
        const date = new Date(key);
        return date.getMonth() + 1 === currentMonth;
      })
      .slice(0, 5);

    return (
      <div style={{ marginBottom: '16px' }}>
        <h4>Reservas por día</h4>
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
              const adjustedHours = isPaddle ? value / 2 : value;
              const earnings = adjustedHours * space.rate;
              return (
                <div key={key} className="table-row">
                  <div className="table-cell">{key}</div>
                  <div className="table-cell">{adjustedHours} Horas</div>
                  <div className="table-cell">{formatCurrency(earnings)}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

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

        {/* Mostrar máximo 5 reservas por día del mes actual con scroll */}
        {renderDailyReservations(space.reservationsByDay)}

        {/* Mostrar reservas por mes */}
        {renderMonthlyReservations(space.reservationsByMonth)}

        <Button onClick={onClose} variant="contained" color="primary" sx={{ marginTop: 2 }}>
          Cerrar
        </Button>
      </Box>
    </Modal>
  );
};

export default SpaceDetailsModal;

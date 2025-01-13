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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}-${month}`;
  };

  const renderReservations = (reservations, period) => {
    const filteredReservations = Object.entries(reservations).filter(([key, value]) => value > 0);
  
    if (filteredReservations.length === 0) {
      return null;
    }
  
    const formatHoursAndMinutes = (hours) => {
      const wholeHours = Math.floor(hours); // Horas completas
      const minutes = Math.round((hours - wholeHours) * 60); // Minutos
      return minutes === 0 ? `${wholeHours} Horas` : `${wholeHours}:${minutes.toString().padStart(2, '0')} Horas`;
    };
  
    return (
      <div>
        <h4>Reservas por {period}</h4>
        <div className="reservation-table">
          <div className="table-header">
            <div className="table-cell">Fecha</div>
            <div className="table-cell">Reservas</div>
            <div className="table-cell">Ganancia</div>
          </div>
          {filteredReservations.map(([key, value]) => {
            const adjustedHours = isPaddle ? value / 2 : value;
            const earnings = adjustedHours * space.rate;
            const displayHours = formatHoursAndMinutes(adjustedHours);
  
            return (
              <div key={key} className="table-row">
                <div className="table-cell">{formatDate(key)}</div>
                <div className="table-cell">{displayHours}</div>
                <div className="table-cell">{formatCurrency(earnings)}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  

  const calculateTotalEarnings = (reservations) => {
    return Object.values(reservations)
      .filter((value) => value > 0)
      .reduce((total, value) => {
        const adjustedHours = isPaddle ? value / 2 : value;
        return total + adjustedHours * space.rate;
      }, 0);
  };

  const dailyEarnings = calculateTotalEarnings(space.reservationsByDay);
  const weeklyEarnings = calculateTotalEarnings(space.reservationsByWeek);
  const monthlyEarnings = calculateTotalEarnings(space.reservationsByMonth);

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

        {renderReservations(space.reservationsByDay, 'día')}
        {renderReservations(space.reservationsByWeek, 'semana')}
        {renderReservations(space.reservationsByMonth, 'mes')}

        <div className="earnings-container">
          <Typography>
            <strong>Ganancia diaria:</strong> {formatCurrency(dailyEarnings)}
          </Typography>
          <Typography>
            <strong>Ganancia semanal:</strong> {formatCurrency(weeklyEarnings)}
          </Typography>
          <Typography>
            <strong>Ganancia mensual:</strong> {formatCurrency(monthlyEarnings)}
          </Typography>
        </div>

        <Button onClick={onClose} variant="contained" color="primary" sx={{ marginTop: 2 }}>
          Cerrar
        </Button>
      </Box>
    </Modal>
  );
};

export default SpaceDetailsModal;

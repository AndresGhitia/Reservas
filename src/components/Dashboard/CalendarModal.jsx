import React, { useState } from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';
import Calendar from './Calendar'; 

const CalendarModal = ({ open, onClose, spaceId }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateClick = (date) => {
    setSelectedDate(date);
    // Aquí podrías manejar la lógica para mostrar los horarios del día seleccionado
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="calendar-modal-title"
      aria-describedby="calendar-modal-description"
    >
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        boxShadow: 24,
        p: 4
      }}>
        <Typography id="calendar-modal-title" variant="h6" component="h2">
          Calendario para el Espacio
        </Typography>
        <Calendar spaceId={spaceId} onDateClick={handleDateClick} />
        {selectedDate && (
          <Typography variant="body1">
            Día seleccionado: {selectedDate.toString()}
          </Typography>
        )}
        <Button onClick={onClose} sx={{ mt: 2 }}>Cerrar</Button>
      </Box>
    </Modal>
  );
};

export default CalendarModal;

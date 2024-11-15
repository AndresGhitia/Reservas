// src/components/ClosedDays.jsx
import React from 'react';
import './ClosedDays.css';

const ClosedDays = ({ closedDays, onToggleDay }) => {
  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}> {/* Añade un ancho máximo si es necesario */}
      <p>Selecciona el o los días en los que el espacio permanecerá cerrado</p>
      <div className="days-grid">
        {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((day) => (
          <div
            key={day}
            onClick={() => onToggleDay(day)}
            className={`day-item ${Array.isArray(closedDays) && closedDays.includes(day) ? 'selected' : ''}`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClosedDays;

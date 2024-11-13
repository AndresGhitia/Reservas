// src/components/ClosedDays.jsx
import React from 'react';
import './ClosedDays.css'; // Archivo CSS para este componente (si lo necesitas)

const ClosedDays = ({ closedDays, onToggleDay }) => {
  return (
    <div>
      <p>Selecciona los días en los que el espacio permanecerá cerrado</p>
      {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((day) => (
        <div
          key={day}
          onClick={() => onToggleDay(day)}
          className={`day-item ${Array.isArray(closedDays) && closedDays.includes(day) ? 'selected' : ''}`}
          style={{ cursor: 'pointer', padding: '8px', borderRadius: '5px', textAlign: 'center', margin: '4px' }}
        >
          {day}
        </div>
      ))}
    </div>
  );
};

export default ClosedDays;

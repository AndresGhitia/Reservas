// src/components/DaySelector.jsx
import React from 'react';
import './DaySelector.css'; // Puedes crear un archivo CSS específico para este componente

const DaySelector = ({ closedDays, onToggleDay }) => {
  return (
    <div className="week-days">
      <h4>Selecciona los días en los que el espacio no abrirá</h4>
      {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"].map((day) => (
        <div
          key={day}
          className={`week-day ${closedDays.includes(day) ? 'selected' : ''}`}
          onClick={() => onToggleDay(day)}
        >
          {day}
        </div>
      ))}
    </div>
  );
};

export default DaySelector;

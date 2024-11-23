import React from 'react';

const TimeSelection = ({ openTime, closeTime, onOpenTimeChange, onCloseTimeChange }) => {
  // Generar opciones de hora de 00:00 a 23:00
  const generateTimeOptions = () =>
    ["--:--", ...Array.from({ length: 24 }, (_, i) => {
      const hour = i.toString().padStart(2, '0') + ":00";
      return hour;
    })];

  return (
    <div className='time-selection'>
      <div className='opening-time'>
        <label>Apertura</label>
        <select value={openTime} onChange={onOpenTimeChange}>
          {generateTimeOptions().map((hour) => (
            <option key={hour} value={hour}>
              {hour}
            </option>
          ))}
        </select>
      </div>

      <div className='close-time'>
        <label>Cierre</label>
        <select
          value={closeTime}
          onChange={onCloseTimeChange}
          disabled={openTime === "--:--"}
        >
          {generateTimeOptions().map((hour) => (
            <option key={hour} value={hour}>
              {hour}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default TimeSelection;

// src/components/TimeSelection.jsx
import React from 'react';

const TimeSelection = ({ openTime, closeTime, onOpenTimeChange, onCloseTimeChange }) => {
  return (
    <div className='time-selection'>
      <div className='opening-time'>
        <label>Apertura</label>
        <select value={openTime} onChange={onOpenTimeChange}>
          {Array.from({ length: 22 }, (_, i) => {
            const hour = (i + 1).toString().padStart(2, '0') + ":00";
            return <option key={hour} value={hour}>{hour}</option>;
          })}
        </select>
      </div>

      <div className='close-time'>
        <label>Cierre</label>
        <select value={closeTime} onChange={onCloseTimeChange} disabled={!openTime}>
          {Array.from({ length: 23 }, (_, i) => {
            const hour = (i + 1).toString().padStart(2, '0') + ":00";
            return <option key={hour} value={hour}>{hour}</option>;
          })}
        </select>
      </div>
    </div>
  );
};

export default TimeSelection;

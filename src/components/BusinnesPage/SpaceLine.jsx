import React from 'react';
import './SpaceLine.css';

const SpaceLine = ({ space, handleViewAvailability }) => {
  return (
    <div className="space-line">
      <div className="space-name">{space.name}</div>
      <div className="space-info">
        <p>Jugadores: {space.players}</p>
        <p>Tarifa: ${space.rate}</p>
        <p>Superficie: {space.surface}</p>
      </div>
      <button className="space-button" onClick={() => handleViewAvailability(space)}>
        Ver disponibilidad
      </button>
    </div>
  );
};

export default SpaceLine;

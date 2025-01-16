import React from 'react';
import './ChartsLabel.css'; // Agrega estilos personalizados

const ChartsLabel = ({ spaces, visibility, toggleVisibility }) => {
  return (
    <div className="legend-container">
      {spaces.map((space, index) => (
        <div
          key={space.name}
          className="legend-item"
          onClick={() => toggleVisibility(space.name)}
          style={{
            textDecoration: visibility[space.name] ? 'none' : 'line-through',
            color: `hsl(${(index * 360) / spaces.length}, 60%, 50%)`,
            cursor: 'pointer',
          }}
        >
          {space.name}
        </div>
      ))}
    </div>
  );
};

export default ChartsLabel;

import React, { useState } from 'react';
import footballIcon from '../../assets/football_icon.png';
import paddleIcon from '../../assets/paddle_icon.png';
import tennisIcon from '../../assets/tennis_icon.png';
import volleyIcon from '../../assets/volley_icon.png';
import hockeyIcon from '../../assets/hockey_icon.png';
import './SpaceLine.css';

const SpaceLine = ({ space, handleViewAvailability }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Función para obtener el ícono basado en el deporte
  const getSportIcon = (sport) => {
    if (!sport) return null;

    switch (sport.toLowerCase()) {
      case 'football':
        return footballIcon;
      case 'paddle':
        return paddleIcon;
      case 'tenis':
        return tennisIcon;
      case 'volley':
        return volleyIcon;
      case 'hockey':
        return hockeyIcon;
      default:
        return null;
    }
  };

  return (
    <div className={`spaceline-card ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="sport-icon">
        {getSportIcon(space.sport) && (
          <img src={getSportIcon(space.sport)} alt={`${space.sport} icon`} />
        )}
        <p>{space.name}</p>
      </div>

      {/* Mostrar detalles solo si está expandido */}
      {isExpanded && (
        <>
          <div className="spaceinfo-top">
            <p>{space.surface}</p>
            <p>Jugadores: {space.players}</p>
          </div>

          <hr />

          <div className="spaceinfo-bottom">
            <div className="space-detail">
              <p style={{ fontSize: 'smaller' }}>VALOR TOTAL</p>
              <p>~${space.rate}</p>
            </div>

            <div className="space-detail">
              <p>~${space.rate / space.players}</p>
              <p style={{ fontSize: 'smaller' }}>POR PERSONA</p>
            </div>
          </div>
        </>
      )}

      <button
        className="details-toggle-button"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? 'Ocultar detalles' : 'Mostrar detalles'}
      </button>

      <button className="spaceline-button" onClick={() => handleViewAvailability(space)}>
        Ver disponibilidad
      </button>
    </div>
  );
};

export default SpaceLine;

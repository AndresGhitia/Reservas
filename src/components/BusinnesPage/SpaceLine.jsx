import React from 'react';
import footballIcon from '../../assets/football_icon.png';
import paddleIcon from '../../assets/paddle_icon.png';
import tennisIcon from '../../assets/tennis_icon.png';
import volleyIcon from '../../assets/volley_icon.png';
import hockeyIcon from '../../assets/hockey_icon.png';
import './SpaceLine.css';

const SpaceLine = ({ space, handleViewAvailability, isExpanded, onToggleExpand }) => {

  const getSportIcon = (sport) => {
    switch (sport?.toLowerCase()) {
      case 'football': return footballIcon;
      case 'paddle': return paddleIcon;
      case 'tenis': return tennisIcon;
      case 'volley': return volleyIcon;
      case 'hockey': return hockeyIcon;
      default: return null;
    }
  };

  return (
    <div className={`spaceline-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="sport-icon">
        {getSportIcon(space.sport) && (
          <img src={getSportIcon(space.sport)} alt={`${space.sport} icon`} />
        )}
        <p>{space.name}</p>
      </div>

      {isExpanded && (
        <>
          <div className="spaceinfo-top">
            {space.surface && <p>Superficie: <strong>{space.surface}</strong></p>}
            {space.players && <p>Jugadores: <strong>{space.players}</strong></p>}
          </div>

          <div className="spaceinfo-top">
            {space.roof && <p>Cerramiento: <strong>{space.roof}</strong></p>}
            {space.walls && <p>Perimetro: <strong>{space.walls}</strong></p>}
          </div>

          <hr />

          <div className="spaceinfo-bottom">
            <div className="space-detail">
              <p style={{ fontSize: 'smaller' }}>VALOR TOTAL</p>
              <p>~<strong>${space.rate}</strong></p>
            </div>

            <div className="space-detail">
              <p>~<strong>${(space.rate / space.players).toFixed(2)}</strong></p>
              <p style={{ fontSize: 'smaller' }}>POR PERSONA</p>
            </div>
          </div>
        </>
      )}

      <div className='card-buttons'>
        <button className="spaceline-button" onClick={() => handleViewAvailability(space)}>
          Horarios
        </button>

        <button className="details-toggle-button" onClick={onToggleExpand}>
          {isExpanded ? 'Cerrar' : 'Ver detalles'}
        </button>
      </div>
    </div>
  );
};

export default SpaceLine;

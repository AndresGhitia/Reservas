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
        {getSportIcon(space.sport) && (<img src={getSportIcon(space.sport)} alt={`${space.sport} icon`} />)}
        <h3>{space.name}</h3>
        <hr />
      </div>

      {isExpanded && (
        <>
          <div className='spaceinfo'>
            <p>Caracteristicas</p>
          </div>
          <div className="spaceinfo-top">
            {space.surface && <p>SUPERFICIE <strong>{space.surface}</strong></p>}
            {space.players && <p>JUGADORES <strong>{space.players}</strong></p>}
          </div>

          <div className="spaceinfo-top">
            <p>CERRAMIENTO <strong>{space.roof === "no" ? "Aire libre" : space.roof}</strong></p>
            {space.walls && (<p>PERIMETRO <strong>{space.walls}</strong></p>)}
          </div>

          <div className="spaceinfo-bottom">
            <div className="space-detail">
              <p>VALOR TOTAL<strong>${space.rate}</strong></p>
            </div>
            <div className="spaceinfo-top">
              <p>POR PERSONA<strong>~${(space.rate / space.players).toFixed(2)}</strong></p>
            </div>
          </div>
          <hr />
        </>
      )}

      <div className='card-buttons'>
        <button className="spaceline-button" onClick={() => handleViewAvailability(space)}>
          HORARIOS
        </button>

        <button className="details-toggle-button" onClick={onToggleExpand}>
          {isExpanded ? 'CERRAR' : 'DETALLES'}
        </button>
      </div>
    </div>
  );
};

export default SpaceLine;

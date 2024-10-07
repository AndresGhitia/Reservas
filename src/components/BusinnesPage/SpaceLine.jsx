import React from 'react';
import footballIcon from '../../assets/football_icon.png';
import paddleIcon from '../../assets/paddle_icon.png';
import tennisIcon from '../../assets/tennis_icon.png';
import volleyIcon from '../../assets/volley_icon.png';
import hockeyIcon from '../../assets/hockey_icon.png';
import './SpaceLine.css';

const SpaceLine = ({ space, handleViewAvailability }) => {
  // Función para obtener el ícono basado en el deporte
  const getSportIcon = (sport) => {
    if (!sport) return null; // Retorna null si no hay deporte definido

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
        console.log('Sport result: Null')
        console.log('Sport:'+ space.sport)
        return null; 
    }
  };

  return (
    <div className="space-line">
      {/* Icono del deporte */}
     <div className="sport"> 
      <div className="space-icon">
        {getSportIcon(space.sport) && (
          <img src={getSportIcon(space.sport)} alt={`${space.sport} icon`} />
        )}
      </div>
      <div className="space-name">{space.name}</div>
      </div>

      <div className="space-info">
        <div className="space-detail">
          <span className="label">Jugadores:</span>
          <span className="value">{space.players}</span>
        </div>
     
        <div className="space-detail">
          <span className="label">Tarifa/hora:</span>
          <span className="value">${space.rate}</span>
        </div>

        <div className="space-detail">
          <span className="label">Tarifa/judador:</span>
          <span className="value">${space.rate/space.players}</span>

        </div>



        <div className="space-detail">
          <span className="label">Superficie:</span>
          <span className="value">{space.surface}</span>
        </div>
      </div>
      <button className="space-button" onClick={() => handleViewAvailability(space)}>
        Ver disponibilidad
      </button>
    </div>
  );
};

export default SpaceLine;

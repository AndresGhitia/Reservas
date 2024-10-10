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
        console.log('Sport:' + space.sport)
        return null;
    }
  };

  return (
    <div className="spaceline-card">
      <div className="sport-icon">
        {getSportIcon(space.sport) && (
          <img src={getSportIcon(space.sport)} alt={`${space.sport} icon`} />
        )}
        <p>{space.name}</p>
      </div>
      <div className="spaceinfo-top">
        <p>{space.surface}</p>
        <p>Jugadores: {space.players}</p>
      </div>
      <hr />
      <div className="spaceinfo-bottom">
        <div className='space-detail'>
        <p>~${space.rate / space.players}</p>
        <p style={{ fontSize: 'smaller' }}>POR PERSONA</p>
        </div>
        <p>${space.rate}</p>
      </div>

      {/* 
      
      //Comente esta Linea porque hasta que no ajuste los estilos de ve desagradable en terminos de diseño

        <div className="space-detail">
          <span className="label">Tipo de espacio:</span>
          <span className="value">{space.roof}</span>
        </div> */}

      <button className="spaceline-button" onClick={() => handleViewAvailability(space)}>
        Ver disponibilidad
      </button>
    </div>
  );
};

export default SpaceLine;

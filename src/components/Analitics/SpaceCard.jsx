import React from 'react';
import './SpaceCard.css';

const SpaceCard = ({ space, onOpenModal }) => {
  return (
    <div className="space-card">
 

      <h3>{space.name}</h3>
      <div className="icon-container">
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="white"
    width="30px"
    height="30px"
  >
    <rect width="4" height="10" x="4" y="10" rx="1"></rect>
    <rect width="4" height="14" x="10" y="6" rx="1"></rect>
    <rect width="4" height="18" x="16" y="2" rx="1"></rect>
  </svg>
</div>
      <p className="data-description">Ingesos de la cancha</p>
      <button onClick={() => onOpenModal(space)}>Ver</button>
    </div>
  );
};

export default SpaceCard;

// components/BuySubscription/BuySubscription.jsx
import React from 'react';
import './BuySuscription.css';

function BuySubscription({ isOpen, onClose, onRenew }) {
  if (!isOpen) return null; 

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2>Renovar Suscripción</h2>
        <p>Tu cuenta ha vencido. Para continuar usando el servicio, por favor renueva tu suscripción.</p>
        <button onClick={onRenew}>Renovar Suscripción</button>
      </div>
    </div>
  );
}

export default BuySubscription;


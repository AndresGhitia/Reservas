import React from 'react';
import './BuySubscription.css';

function BuySubscription({ isOpen, onClose, onRenew }) {
  if (!isOpen) return null;

  return (
    <div className="modal-subscription">
      <div className='modal-subscription-dialog'>
        <div className="modal-subscription-form">
          <div className='subscription-header'>
            <p>Renovar Suscripción</p>
            <span className="close" onClick={onClose}>&times;</span>
          </div>
          <div className='subscription-body'>
            <p>Tu cuenta ha vencido. Para continuar usando el servicio, por favor renueva tu suscripción.</p>
            <div className='subscription-buttons'>
              <button className='renew-button' onClick={onRenew}>Renovar Suscripción</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuySubscription;

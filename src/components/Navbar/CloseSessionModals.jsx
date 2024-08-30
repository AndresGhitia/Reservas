
import React from 'react';
import './CloseSessionModals.css';
import './Navbar.css'

export const WarningModal = ({ countdown }) => {
  return (
    <div className="warning-modal-overlay">
      <div className="warning-modal">
        <h2>¿Estás ahí?</h2>
        <p>Tu sesión se cerrará en {countdown} segundos.</p>
      </div>
    </div>
  );
};

export const SessionClosedModal = ({ onClose }) => {
  return (
    <div className="session-closed-modal-overlay">
      <div className="session-closed-modal">
        <h2>Sesión Cerrada</h2>
        <p>Cerramos tu sesión por falta de actividad.</p>
        <button onClick={onClose}>Aceptar</button>
      </div>
    </div>
  );
};

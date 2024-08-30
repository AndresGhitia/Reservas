
import React from 'react';
import './CloseSessionModals.css';
import './Navbar.css'

export const WarningModal = ({ countdown, onStayLoggedIn }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Inactividad detectada</h2>
        <p>Tu sesión se cerrará en {countdown} segundos por inactividad.</p>
        <button onClick={onStayLoggedIn}>Permanecer Conectado</button>
      </div>
    </div>
  );
};

export const SessionClosedModal = ({ onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Sesión Cerrada</h2>
        <p>Cerramos tu sesión por falta de actividad.</p>
        <button onClick={onClose}>Aceptar</button>
      </div>
    </div>
  );
};

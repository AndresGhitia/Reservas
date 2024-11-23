// src/components/ProfileInfoModal.jsx
import React from 'react';
import './ProfileInfoModal.css';

function ProfileInfoModal({ userData, userCollection, numSpaces, onClose, onDeleteAccount }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Mi cuenta</h2>
        {userCollection === 'users' ? (
          <div>
            <h3>Información del Usuario</h3>
            <p>Nombre: {userData?.firstName} {userData?.lastName}</p>
            <p>Email: {userData?.email}</p>
            
          </div>
        ) : userCollection === 'owners' ? (
          <div>
            <h3>Información del Propietario</h3>
            <p>Tipo de cuenta: Administrador (Owner)</p>
            <p>Establecimiento: {userData?.establishmentName}</p>
            <p>Dirección: {userData?.address}</p>
            <p>Número de espacios activos: {numSpaces}</p> 
            <p>Número de contacto: {userData?.whatsapp}</p>
          </div>
        ) : null}
      
       <div className="modal-buttons">
          <button onClick={onClose}>Cerrar</button>
          <button onClick={onDeleteAccount} className="delete-button">Borrar cuenta</button>
        </div>
      </div>
    </div>
  );
}

export default ProfileInfoModal;


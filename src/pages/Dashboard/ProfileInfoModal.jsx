// src/components/ProfileInfoModal.jsx
import React from 'react';
import './ProfileInfoModal.css'; 

function ProfileInfoModal({ userData, userCollection, onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Mi cuenta</h2>
        {userCollection === 'users' ? (
          <div>
            <h3>Información del Usuario</h3>
            <p>Nombre: {userData?.firstName} {userData?.lastName}</p>
            <p>Email: {userData?.email}</p>
            {/* más campos si es necesario */}
          </div>
        ) : userCollection === 'owners' ? (
          <div>
            <h3>Información del Propietario</h3>
            <p>Nombre del Establecimiento: {userData?.establishmentName}</p>
            <p>Propietario: {userData?.ownerName}</p>
            <p>Email: {userData?.email}</p>
            {/*  más campos si es necesario */}
          </div>
        ) : null}
        <button onClick={onClose}>Cerrar</button>
      </div>
    </div>
  );
}

export default ProfileInfoModal;

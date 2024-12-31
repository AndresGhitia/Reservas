// src/components/ProfileInfoModal.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfileInfoModal.css';
// import { handleDeleteSpaces } from '../../utils/handleDeleteSpaces';

function ProfileInfoModal({ userData, userCollection, numSpaces, onClose, onDeleteAccount }) {
  const navigate = useNavigate();

  const userEmail = userData?.establishmentEmail || userData?.email;

  return (
    <div className="profile-modal">
      <div className='profile-dialog'>
        <div className='profile-content-form'>
          <div className='profile-header'>
            <p>Mi cuenta</p>
            <span className="close" onClick={onClose}>&times;</span>
          </div>
          <div className="profile-body">
            {userCollection === 'users' ? (
              <div>
                <h1>Información del Usuario</h1>
                <p>Nombre: {userData?.firstName} {userData?.lastName}</p>
                <p>Email: {userData?.email}</p>
              </div>
            ) : userCollection === 'owners' ? (
              <div>
                <h1>Información del Propietario</h1>
                <p>Tipo de cuenta: Administrador (Owner)</p>
                <p>Establecimiento: {userData?.establishmentName}</p>
                <p>Dirección: {userData?.address}</p>
                <p>Número de espacios activos: {numSpaces}</p>
                <p>Número de contacto: {userData?.whatsapp}</p>
              </div>
            ) : null}

            <div className="profile-buttons">
              <button className="edit-button" onClick={() => navigate(`/edit-data?email=${userEmail}`)}>Editar datos </button>
              <button className="delete-button" onClick={onDeleteAccount} >Borrar cuenta</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileInfoModal;


// src/components/ProfileInfoModal.jsx
import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import './ProfileInfoModal.css';

function ProfileInfoModal({ userData, userCollection, numSpaces, onClose, onDeleteAccount }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
             
              {/* Si está cargando, mostramos el spinner en lugar del botón */}
              {loading ? (
                <Loading /> // El spinner se muestra mientras se está procesando la eliminación
              ) : (
                <button className="delete-button" onClick={onDeleteAccount}>Borrar cuenta</button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileInfoModal;


import React from 'react';
import { FaMousePointer } from 'react-icons/fa'; // Icono de puntero de mouse
import './CreateClubWebButton.css';

function CreateClubWebButton({ setShowAccountTypeModal, setFocusOnOwner }) {
  return (
    <div
      className="create-clubweb-button"
      onClick={() => {
        setFocusOnOwner(true);
        setShowAccountTypeModal(true);
      }}
    >
      <div className='create-clubweb'>
        <span className="create-clubweb-text">Crea tu ClubWeb</span>
        {/* <FaMousePointer className="create-clubweb-icon" size={16} /> */}
      </div>
    </div>
  );
}

export default CreateClubWebButton;

import React, { useState } from 'react';
import './UserIconDropdown.css';
import { FaUserCircle } from 'react-icons/fa';

function UserIconDropdown({ user, userData, handleSignOut, setShowLogin, setShowAccountTypeModal, setFocusOnOwner }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="user-icon-dropdown">
      <div className="user-icon-wrapper" onClick={toggleDropdown}>
        <div className="menu-icon">
          <div className="menu-line"></div>
          <div className="menu-line"></div>
          <div className="menu-line"></div>
        </div>
        <FaUserCircle className="user-icon" size={32} />
      </div>

      {isOpen && (
        <div className="dropdown-menu">
          {!user ? (
            <>
              <div
                className="menu-item"
                onClick={() => {
                    setFocusOnOwner(false); // Indica que no es para administrador
                    setShowAccountTypeModal(true); // Abre el modal
                  }}
              >
                Registrarse
              </div>

              <div className="menu-item" onClick={() => setShowLogin(true)}>
                Iniciar sesión
              </div>

              <div
                className="menu-item"
                onClick={() => {
                    setFocusOnOwner(true); // Indica que no es para administrador
                    setShowAccountTypeModal(true); // Abre el modal
                  }}
              >
                Crea tu Clubweb
              </div>
            </>
          ) : (
            <>
              <div className="menu-item">{userData?.name || 'Usuario'}</div>
              <div className="menu-item" onClick={handleSignOut}>
                Cerrar sesión
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default UserIconDropdown;

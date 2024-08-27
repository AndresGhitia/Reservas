import React, { useState } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link } from 'react-router-dom';
import LoginForm from '../LoginForm/LoginForm'; 
import { handleSignOut, initializeAuthEffect, initializeInactivityEffect } from './NavbarFunctions'; 

function Navbar() {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [countdown, setCountdown] = useState(30);

  initializeAuthEffect(setUser, setUserData);
  initializeInactivityEffect(user, setShowWarningModal, setCountdown, handleSignOut, setUser, setUserData);

  const handleSignInClick = () => {
    setShowLogin(true);
  };

  const handleCloseModal = () => {
    setShowLogin(false);
  };

  return (
    <div className='navbar'>
      <Link to="/">
        <img src={assets.logo_header} alt="logo de la marca" className='logo' />
      </Link>
      <ul className='navbar-menu'>
        <li className='ubicacion'>UBICACION</li>
        <li className='canchas'>CANCHAS</li>
        <li className='appmobile'>APP MOBILE</li>
        <li className='contacto'>CONTACTO</li>
      </ul>
      <div className='navbar-right'>
        <img src={assets.search_icon} alt="" />
        <div className='navbar-search-icon'>
          <img src={assets.cart_icon} alt="" />
          <div className='dot'></div>
        </div>
        {user ? (
          <div className='user-info'>
            <span>Hola, {userData?.firstName || userData?.ownerName || user.email}</span>
            <button className='signout-btn' onClick={handleSignOut}>Cerrar Sesión</button>
          </div>
        ) : (
          <button className='signin-btn' onClick={handleSignInClick}>Sign In / Crear Cuenta</button>
        )}
      </div>
      {showLogin && <LoginForm onClose={handleCloseModal} />}
      
      {showWarningModal && (
        <>
          <div className='warning-overlay'></div>
          <div className='warning-modal'>
            <p>¿Estás ahí? Tu sesión se cerrará en {countdown} segundos.</p>
          </div>
        </>
      )}
    </div>
  );
}

export default Navbar;

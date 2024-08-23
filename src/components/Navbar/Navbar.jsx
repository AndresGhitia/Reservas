import React, { useState } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link } from 'react-router-dom';
import LoginForm from '../RegisterForm/LoginForm'; 

function Navbar() {
  const [showLogin, setShowLogin] = useState(false);

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
        <button onClick={handleSignInClick}>Sign In</button>
      </div>
      {showLogin && <LoginForm onClose={handleCloseModal} />} {/* Muestra el modal de inicio de sesión */}
    </div>
  );
}

export default Navbar;

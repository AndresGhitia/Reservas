import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link } from 'react-router-dom';
import LoginForm from '../RegisterForm/LoginForm'; 
import { auth, db } from '../../firebase'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; 

function Navbar() {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          const ownerDoc = await getDoc(doc(db, 'owners', currentUser.uid));
          if (ownerDoc.exists()) {
            setUserData(ownerDoc.data());
          }
        }
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe();
  }, []);

  // Cerrar sesión automáticamente después de 10 segundos de inactividad
  useEffect(() => {
    let inactivityTimeout;

    const handleInactivity = () => {
      signOut(auth)
        .then(() => {
          setUser(null);
          setUserData(null); 
        })
        .catch((error) => {
          console.error("Error al cerrar sesión: ", error);
        });
    };

    const resetTimer = () => {
      clearTimeout(inactivityTimeout);
      inactivityTimeout = setTimeout(handleInactivity, 90000); // Al minuto y medio se cierra sesion
    };

    if (user) {
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keydown', resetTimer);
      resetTimer(); // Inicializar temporizador cuando el usuario inicia sesión
    }

    return () => {
      clearTimeout(inactivityTimeout);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [user]);

  const handleSignInClick = () => {
    setShowLogin(true);
  };

  const handleCloseModal = () => {
    setShowLogin(false);
  };

  const handleSignOut = () => {
    if (window.confirm("¿Estás seguro que quieres cerrar sesión?")) {
      signOut(auth).then(() => {
        setUser(null);
        setUserData(null); 
      }).catch((error) => {
        console.error("Error al cerrar sesión: ", error);
      });
    }
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
    </div>
  );
}

export default Navbar;

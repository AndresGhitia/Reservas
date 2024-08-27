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
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [countdown, setCountdown] = useState(30);

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

  useEffect(() => {
    let inactivityTimeout;
    let warningTimeout;

    const handleInactivity = () => {
      signOut(auth)
        .then(() => {
          setUser(null);
          setUserData(null);
          setShowWarningModal(false); // Asegúrate de cerrar el modal
        })
        .catch((error) => {
          console.error("Error al cerrar sesión: ", error);
        });
    };

    const showWarning = () => {
      setShowWarningModal(true);
      setCountdown(30); // Inicializa la cuenta regresiva en 30
    };

    const resetTimer = () => {
      clearTimeout(inactivityTimeout);
      clearTimeout(warningTimeout);
      setShowWarningModal(false); // Cierra el modal si estaba visible

      // Programa la advertencia a los 60 segundos
      warningTimeout = setTimeout(showWarning, 60000); 
      // Programa el cierre de sesión a los 90 segundos
      inactivityTimeout = setTimeout(handleInactivity, 90000);
    };

    if (user) {
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keydown', resetTimer);
      resetTimer(); // Inicializa el temporizador cuando el usuario inicia sesión
    }

    return () => {
      clearTimeout(inactivityTimeout);
      clearTimeout(warningTimeout);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, [user]);

  // Efecto para la cuenta regresiva del modal
  useEffect(() => {
    let countdownInterval;
    if (showWarningModal) {
      countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            signOut(auth); // Cierra sesión cuando el contador llegue a 0
            setShowWarningModal(false); // Cierra el modal cuando el contador llegue a 0
            return 0; // Asegura que el contador no sea negativo
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(countdownInterval);
  }, [showWarningModal]);

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
            <button className='signout-btn' onClick={() => signOut(auth)}>Cerrar Sesión</button>
          </div>
        ) : (
          <button className='signin-btn' onClick={handleSignInClick}>Sign In / Crear Cuenta</button>
        )}
      </div>
      {showLogin && <LoginForm onClose={handleCloseModal} />}
      
      {showWarningModal && (
  <>
    <div className='warning-overlay'></div> {/* Capa de superposición */}
    <div className='warning-modal'>
      <p>¿Estás ahí? Tu sesión se cerrará en {countdown} segundos.</p>
    </div>
  </>
)}
    </div>
  );
}

export default Navbar;

import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import LoginForm from '../LoginForm/LoginForm.jsx';
import { auth, db } from '../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { WarningModal, SessionClosedModal } from './CloseSessionModals.jsx';
import { resetInactivityTimer } from './authUtils.js';
import UserProfileDropdown from '../../utils/UserProfileDropdown'; 
import { useLocation } from 'react-router-dom'; // Importar useLocation

function Navbar() {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showSessionClosedModal, setShowSessionClosedModal] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const navigate = useNavigate();
  const location = useLocation();  // Obtener la ubicación actual

  // Obtener la ruta actual, verificar si es el dashboard
  const isDashboard = location.pathname === '/dashboard';

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
    if (user) {
      const clearInactivity = resetInactivityTimer(
        user,
        setShowWarningModal,
        setCountdown,
        handleSignOut,
        setUser,
        setUserData
      );
      return clearInactivity;
    }
  }, [user]);

  const handleSignOut = (isAutomatic = false) => {
    if (!isAutomatic && !window.confirm("¿Estás seguro que quieres cerrar sesión?")) {
      return;
    }
    signOut(auth)
      .then(() => {
        setUser(null);
        setUserData(null);
        navigate('/');
        if (isAutomatic) {
          setShowSessionClosedModal(true);
        }
      })
      .catch((error) => {
        console.error("Error al cerrar sesión: ", error);
      });
  };

  return (
    <>
      <div className='navbar'>
        <img src={assets.logo_header} alt="logo de la marca" className='logo' />
  
        <div className='navbar-right'>
          <div className='navbar-search-icon'>
          </div>
  
          {!user ? (
            <button onClick={() => setShowLogin(true)}>Sign In</button>
          ) : (
            <UserProfileDropdown
              userData={userData}
              user={user}
              handleSignOut={handleSignOut}
              isDashboard={isDashboard}
            />
          )}
        </div>
      </div>
  
      {/* Modales fuera del contenedor navbar */}
      {showLogin && <LoginForm onClose={() => setShowLogin(false)} />}
      {showWarningModal && (
        <WarningModal
          countdown={countdown}
          onStayLoggedIn={() => setShowWarningModal(false)}
        />
      )}
      {showSessionClosedModal && (
        <SessionClosedModal onClose={() => setShowSessionClosedModal(false)} />
      )}
    </>
  );
  
}

export default Navbar;

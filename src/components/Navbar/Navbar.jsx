import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import LoginForm from '../LoginForm/LoginForm.jsx';
import AccountTypeModal from '../AccountTypeModal/AccountTypeModal.jsx';
import RegisterForm from '../RegisterForm/RegisterForm.jsx';
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
  const [showAccountTypeModal, setShowAccountTypeModal] = useState(false);
  const [showRegister, setShowRegister] = useState(false); // Manejo del registro
  const [accountType, setAccountType] = useState('user'); // Por defecto, usuario

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

  const handleAccountTypeSelect = (type) => {
    setAccountType(type); // Guardamos el tipo de cuenta seleccionado
    setShowRegister(true); // Abrimos el formulario de registro
  };

  return (
    <>
      <div className='navbar'>
        <div className='navbar-title'>
          <h3>ClubWeb!</h3>
        </div>
        <div className='navbar-right'>
          {!user ? (
            <span onClick={() => setShowLogin(true)}>INICIAR SESION</span>
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

      {showLogin && (
        <LoginForm
          onClose={() => {
            setShowLogin(false); // Cierra el LoginForm
            setShowAccountTypeModal(true); // Abre el modal de tipo de cuenta
          }}
        />
      )}

      {showAccountTypeModal && (
        <AccountTypeModal
          open={showAccountTypeModal}
          onClose={() => setShowAccountTypeModal(false)} // Cierra el modal
          onSelectAccountType={handleAccountTypeSelect}

          setShowRegister={setShowRegister} // Pasa la función para manejar el registro
        />
      )}

      {showRegister && (
        <RegisterForm
          onClose={() => {
            setShowRegister(false); // Cierra el formulario de registro
            setShowAccountTypeModal(true); // Reabre el modal de tipo de cuenta si es necesario
          }}
          accountType={accountType} // Pasamos el tipo de cuenta al formulario

        />
      )}

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

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
import { useLocation } from 'react-router-dom';
import UserIconDropdown from '../UserIconDropdown/UserIconDropdown.jsx';
import CreateClubWebButton from '../CreateClubWebButton/CreateClubWebButton.jsx';

function Navbar() {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showSessionClosedModal, setShowSessionClosedModal] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const navigate = useNavigate();
  const location = useLocation();  
  const [showAccountTypeModal, setShowAccountTypeModal] = useState(false);
  const [showRegister, setShowRegister] = useState(false); 
  const [accountType, setAccountType] = useState('user');
  const [focusOnOwner, setFocusOnOwner] = useState(false);
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

  const handleCloseLoginForm = () => {
    setShowLogin(false); // Cerramos el LoginForm
    setShowAccountTypeModal(false); // Cerramos el AccountTypeModal
  };

  const handleCloseAccountTypeModal = () => {
    if (!showLogin) {
      setShowAccountTypeModal(false); // Solo cierra el AccountTypeModal si el LoginForm no está abierto
    }
  }

  const handleSwitchToLogin = () => {
    setShowRegister(false); // Cierra registro
    setShowAccountTypeModal(false); // Cierra tipo de cuenta
    setShowLogin(true); // Abre login
  };

  return (
    <>
      <div className='navbar'>
        <div className='navbar-title'>
          <a href="/">
            <img src={assets.clubweb_logo} alt="ClubWeb Logo" />
          </a>
        </div>
        <div className='navbar-right'>
          {!user ? (
            <div className="navbar-right">
  
  <CreateClubWebButton
   setShowAccountTypeModal={setShowAccountTypeModal}
   setFocusOnOwner={setFocusOnOwner} 
  />

  <UserIconDropdown
    user={user}
    userData={userData}
    handleSignOut={handleSignOut}
    setShowLogin={setShowLogin}
    setShowAccountTypeModal={setShowAccountTypeModal}
    setFocusOnOwner={setFocusOnOwner}
  /> 
    </div>
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
        show={showLogin} 
          onClose={handleCloseLoginForm}
          setShowAccountTypeModal={setShowAccountTypeModal}
          setShowLogin={setShowLogin} 
        />
      )}

      {showAccountTypeModal && (
        <AccountTypeModal
          open={showAccountTypeModal}
          onClose={handleCloseAccountTypeModal} // Cierra solo el AccountTypeModal
          onSelectAccountType={handleAccountTypeSelect}
          setShowRegister={setShowRegister} // Pasa la función para manejar el registro
          onSwitchToLogin={handleSwitchToLogin}
          focusOnOwner={focusOnOwner}
        />
      )}

      {showRegister && (
        <RegisterForm
          onClose={() => {
            setShowRegister(false); // Cierra el formulario de registro
            setShowAccountTypeModal(false); // Reabre el modal de tipo de cuenta si es necesario

          }}
          accountType={accountType} // Pasamos el tipo de cuenta al formulario
          onSwitchToLogin={handleSwitchToLogin}


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

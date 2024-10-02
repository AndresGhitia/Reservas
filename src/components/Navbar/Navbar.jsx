
import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import LoginForm from '../LoginForm/LoginForm.jsx';
import { auth, db } from '../../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { WarningModal, SessionClosedModal } from './CloseSessionModals.jsx'; // Importa los modales
import { resetInactivityTimer } from './authUtils.js';

function Navbar() {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showSessionClosedModal, setShowSessionClosedModal] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const navigate = useNavigate();

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
            console.log('Negocio: ' + userData.establishmentName)
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

  const handleSignInClick = () => {
    setShowLogin(true);
  };

  const handleCloseModal = () => {
    setShowLogin(false);
  };

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

  const handleOwnerDashboardClick = () => {
    if (userData?.establishmentName) {
      const establishmentName = userData.establishmentName.replace(/\s+/g, '-');
      navigate(`/dashboard/${establishmentName}`);
    } else {
      navigate('/owner-dashboard');
    }
  };

  return (
    <div className='navbar'>
      <img src={assets.logo_header} alt="logo de la marca" className='logo' />
      <ul className='navbar-menu'>
        <Link to="/"></Link>
        <li className='ubicacion'>UBICACION</li>
        <li className='canchas'>CANCHAS</li>
        <li className='appmobile'>APP MOBILE</li>
        <li className='contacto'>CONTACTO</li>
      </ul>
      <div className='navbar-right'>
        <img src={assets.search_icon} alt="" />
        <div className='navbar-search-icon'>
          <Link to='/cart'>
            <img src={assets.cart_icon} alt="" />
          </Link>
          <div className='dot'></div>
        </div>
        {!user ? (
          <button onClick={() => setShowLogin(true)}>Sign In</button>
        ) : (
          <div className='navbar-profile'>
            <div className='navbar-profile-user'>
              <span>{`Hola, ${userData?.firstName || userData?.ownerName || user.email}`}</span>
              <img src={assets.profile_icon} alt="" />
            </div>
            <ul className="nav-profile-dropdown">
              <li><img src={assets.booking_icon} alt="" />Reservas</li>
              <hr />
              <li onClick={() => handleSignOut(false)}><img src={assets.logout_icon} alt="" />Logout</li>
              <hr />
              {userData?.establishmentName && (
                <li onClick={handleOwnerDashboardClick}><img src={assets.profile_icon} alt="" />Dashboard</li>
              )}
            </ul>
          </div>
        )}
      </div>
      {showLogin && <LoginForm onClose={handleCloseModal} />}
      {showWarningModal && (
        <WarningModal
          countdown={countdown}
          onStayLoggedIn={() => setShowWarningModal(false)}
        />
      )}
      {showSessionClosedModal && (
        <SessionClosedModal onClose={() => setShowSessionClosedModal(false)} />
      )}
    </div>
  );
}

export default Navbar;

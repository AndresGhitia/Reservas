import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // Importar useLocation para obtener la ruta actual
import { assets } from '../../src/assets/assets'; 
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { resetInactivityTimer } from '../components/Navbar/authUtils'; 

function UserProfileDropdown() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showSessionClosedModal, setShowSessionClosedModal] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const navigate = useNavigate();
  const locationUrl = useLocation(); // Obtener la ruta actual

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

  // Cierre de sesión
  const handleSignOut = (isAutomatic = false) => {
    if (!isAutomatic && !window.confirm("¿Estás seguro que quieres cerrar sesión?")) {
      return;
    }
    signOut(auth)
      .then(() => {
        setUser(null);
        setUserData(null);
        console.log('URL: '+locationUrl.pathname)
        if (locationUrl.pathname == '/Dashboard') {
          navigate('/');
        }
        if (isAutomatic) {
          setShowSessionClosedModal(true);
        }
      })
      .catch((error) => {
        console.error("Error al cerrar sesión: ", error);
      });
  };

  // Navegación al dashboard del dueño
  const handleOwnerDashboardClick = () => {
    if (userData?.establishmentName) {
      const establishmentName = userData.establishmentName.replace(/\s+/g, '-');
      navigate(`/dashboard/${establishmentName}`);
    } else {
      navigate('/owner-dashboard');
    }
  };

  if (!user) {
    // Si el usuario no está autenticado, mostrar la opción de iniciar sesión
    return (
      <button onClick={() => navigate('/login')} className="login-button">
        Iniciar sesión
      </button>
    );
  }

  return (
    <div className='navbar-profile'>
      <div className='navbar-profile-user'>
        <span>{`Hola, ${userData?.firstName || userData?.ownerName || user.email}`}</span>
        <img src={assets.profile_icon} alt="profile icon" /> 
      </div>
      <ul className="nav-profile-dropdown">
        <li><img src={assets.booking_icon} alt="Reservas icon" />Reservas</li>
        <hr />
        <li onClick={() => handleSignOut(false)}><img src={assets.logout_icon} alt="Logout icon" />Logout</li>
        <hr />
        {userData?.establishmentName && (
          <li onClick={handleOwnerDashboardClick}><img src={assets.profile_icon} alt="Dashboard icon" />Dashboard</li>
        )}
      </ul>

      {showWarningModal && (
        <showWarningModal
          countdown={countdown}
          onStayLoggedIn={() => setShowWarningModal(false)}
        />
      )}
      {showSessionClosedModal && (
        <showSessionClosedModal onClose={() => setShowSessionClosedModal(false)} />
      )}
    </div>
  );
}

export default UserProfileDropdown;
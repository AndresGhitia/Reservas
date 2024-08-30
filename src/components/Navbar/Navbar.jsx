import React, { useState, useEffect } from 'react';
import './Navbar.css';
import { assets } from '../../assets/assets';
import { Link, useNavigate } from 'react-router-dom';
import LoginForm from '../RegisterForm/LoginForm'; 
import { auth, db } from '../../firebase'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore'; 

function Navbar() {
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null); 
  const navigate = useNavigate(); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Primero, intenta obtener los datos del usuario desde la colección 'users'
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        } else {
          // Si no existe en 'users', intenta con 'owners'
          const ownerDoc = await getDoc(doc(db, 'owners', currentUser.uid));
          if (ownerDoc.exists()) {
            const ownerData = ownerDoc.data();
            setUserData(ownerData);
          }
        }
      } else {
        setUserData(null);
      }
    });

    return () => unsubscribe(); 
  }, []);

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
        navigate('/'); 
      }).catch((error) => {
        console.error("Error al cerrar sesión: ", error);
      });
    }
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
            {userData?.establishmentName && (
              <button className='dashboard-btn' onClick={handleOwnerDashboardClick}>Panel de Comercio</button>
            )}
            <button className='signout-btn' onClick={handleSignOut}>Cerrar Sesión</button>
          </div>
        ) : (
          <button className='signin-btn' onClick={handleSignInClick}>Sign In | Crear Cuenta</button>
        )}
      </div>
      {showLogin && <LoginForm onClose={handleCloseModal} />}
    </div>
  );
}

export default Navbar;

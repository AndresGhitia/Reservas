// src/components/UserProfileDropdown.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import { assets } from '../../src/assets/assets'; 
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection,getDocs  } from 'firebase/firestore';
import { resetInactivityTimer } from '../components/Navbar/authUtils'; 
import onDeleteAccount from '../../functions/onDeleteAccount'
import ProfileInfoModal from '../pages/Dashboard/ProfileInfoModal';  

function UserProfileDropdown() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userCollection, setUserCollection] = useState(null); // Estado para identificar si es 'owners' o 'users'
  const [showAccountModal, setShowAccountModal] = useState(false); // Estado para mostrar el modal
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showSessionClosedModal, setShowSessionClosedModal] = useState(false);
  const [numSpaces, setNumSpaces] = useState(0); // Estado para almacenar el número de espacios activos
  const [countdown, setCountdown] = useState(30);
  const navigate = useNavigate();
  const locationUrl = useLocation(); // Obtener la ruta actual

useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    setUser(currentUser);
    if (currentUser) {
      // Comprobar si es un usuario
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
        setUserCollection('users'); // Identificar que es de la colección 'users'
      } else {
        // Comprobar si es un propietario
        const ownerDoc = await getDoc(doc(db, 'owners', currentUser.uid));
        if (ownerDoc.exists()) {
          setUserData(ownerDoc.data());
          setUserCollection('owners'); // Identificar que es de la colección 'owners'

          // Obtener el número de espacios activos (número de documentos en la subcolección 'spaces')
          const spacesRef = collection(db, 'owners', currentUser.uid, 'spaces');
          const spacesSnapshot = await getDocs(spacesRef);
          
          // Verificar si la subcolección existe y tiene documentos
          if (spacesSnapshot.empty) {
        //    console.log("No hay espacios disponibles");
            setNumSpaces(0);
          } else {
            setNumSpaces(spacesSnapshot.size); // Contar los espacios activos
        //    console.log("Numero de espacios: "+ numSpaces);

          }
        }
      }
    } else {
      setUserData(null);
      setUserCollection(null); // Resetear el estado de la colección si no hay usuario
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
     //   console.log('URL: ' + locationUrl.pathname)
        if (locationUrl.pathname.includes('/dashboard')) {
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

  // Navegación al dashboard del dueño o Home
  const handleNavigate = () => {
    if (locationUrl.pathname === '/') {
      // Si ya está en Home, ir al Dashboard del dueño
      handleOwnerDashboardClick();
    } else {
      // Si no está en Home, navegar a Home
      navigate('/');
    }
  };

  // Navegación al dashboard del dueño
  const handleOwnerDashboardClick = () => {
    if (userData?.establishmentName) {
      const establishmentName = userData.establishmentName.replace(/\s+/g, '-');
      navigate(`/dashboard/${establishmentName}/list`);
    } else {
      navigate('/owner-dashboard');
    }
  };

  const handleAccountClick = () => {
    setShowAccountModal(true); // Abrir el modal cuando se haga clic en "Mi cuenta"
  };

  const handleDeleteAccount = async () => {
    const confirmation = window.confirm('¿Estás seguro de que deseas borrar tu cuenta? Se borrarán todos tus datos, incluyendo información de tu complejo y reservas.');
  
    if (confirmation) {
      try {
        // Mostrar feedback al usuario (puedes usar un estado de carga aquí si lo deseas)
        console.log('Eliminando cuenta...');
  
        // Implementar la lógica de eliminación (usa tu función deleteOwnerData)
       // await deleteOwnerData(); // Asegúrate de importar esta función correctamente
          await onDeleteAccount();
        alert('Tu cuenta ha sido eliminada con éxito.');
        setShowAccountModal(false); // Cerrar modal
        signOut(auth); // Cerrar sesión después de borrar la cuenta
        navigate('/'); // Redirigir al usuario al home
      } catch (error) {
        console.error('Error al eliminar la cuenta:', error);
        alert('Hubo un error al eliminar tu cuenta. Por favor, inténtalo de nuevo.');
      }
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
        <li onClick={handleAccountClick}>
          <img src={assets.booking_icon} alt="Reservas icon" />Mi cuenta
        </li>
        <hr />
        <li onClick={() => handleSignOut(false)}><img src={assets.logout_icon} alt="Logout icon" />Logout</li>
        <hr />
        {/* Mostrar la opción de Dashboard o Home solo si pertenece a la colección 'owners' */}
        {userCollection === 'owners' && (
          <li onClick={handleNavigate}>
            <img src={assets.profile_icon} alt="Navigation icon" />
            {locationUrl.pathname === '/' ? 'Dashboard' : 'Home'}
          </li>
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

      {/* Aquí llamamos al componente ProfileInfoModal */}
      {showAccountModal && (
        <ProfileInfoModal 
          userData={userData} 
          userCollection={userCollection} 
          onClose={() => setShowAccountModal(false)} 
          numSpaces={numSpaces} // Pasar número de espacios activos
          onDeleteAccount={handleDeleteAccount}
        />
      )}
    </div>
  );
}

export default UserProfileDropdown;

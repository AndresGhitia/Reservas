import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from '../../firebase'; 

export const handleAuthStateChange = (setUser, setUserData) => {
  return onAuthStateChanged(auth, async (currentUser) => {
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
};

export const handleSignOut = (setUser, setUserData, isAutomatic = false) => {
  if (isAutomatic || window.confirm("¿Estás seguro que quieres cerrar sesión?")) {
    signOut(auth)
      .then(() => {
        setUser(null);
        setUserData(null);
      })
      .catch((error) => {
        console.error("Error al cerrar sesión: ", error);
      });
  }
};

export const resetInactivityTimer = (
  user,
  setShowWarningModal,
  setCountdown,
  handleSignOut,
  setUser,
  setUserData
) => {
  var inactivityTimeout;
  var warningTimeout;
  var countdownInterval;

  const handleInactivity = () => {
    handleSignOut(setUser, setUserData, true); 
    setShowWarningModal(false);
  };

  const showWarning = () => {
    setShowWarningModal(true);
    setCountdown(10);

    countdownInterval = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(countdownInterval); 
        }
        return prevCountdown - 1;
      });
    }, 1000); // Decrementar cada segundo
  };

  const resetTimer = () => {
    clearTimeout(inactivityTimeout);
    clearTimeout(warningTimeout);
    clearInterval(countdownInterval); // Limpiar el intervalo de la cuenta regresiva
    setShowWarningModal(false);

  //  warningTimeout = setTimeout(showWarning, 10000); // Mostrar advertencia tras 10 segundos
   // inactivityTimeout = setTimeout(handleInactivity, 20000); // Cerrar sesión tras 40 segundos
  };

  if (user) {
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();
  }

  return () => {
    clearTimeout(inactivityTimeout);
    clearTimeout(warningTimeout);
    clearInterval(countdownInterval);
    window.removeEventListener('mousemove', resetTimer);
    window.removeEventListener('keydown', resetTimer);
  };
};

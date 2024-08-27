import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
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

export const resetInactivityTimer = (
  user,
  setShowWarningModal,
  setCountdown,
  handleSignOut,
  setUser,
  setUserData
) => {
  let inactivityTimeout;
  let warningTimeout;

  const handleInactivity = () => {
    handleSignOut(auth);
    setUser(null);
    setUserData(null);
    setShowWarningModal(false); 
  };

  const showWarning = () => {
    setShowWarningModal(true);
    setCountdown(30); 
  };

  const resetTimer = () => {
    clearTimeout(inactivityTimeout);
    clearTimeout(warningTimeout);
    setShowWarningModal(false); 

    warningTimeout = setTimeout(showWarning, 60000); 
    inactivityTimeout = setTimeout(handleInactivity, 90000); 
  };

  if (user) {
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer(); 
  }

  return () => {
    clearTimeout(inactivityTimeout);
    clearTimeout(warningTimeout);
    window.removeEventListener('mousemove', resetTimer);
    window.removeEventListener('keydown', resetTimer);
  };
};

export const initializeAuthEffect = (setUser, setUserData) => {
  useEffect(() => {
    const unsubscribe = handleAuthStateChange(setUser, setUserData);
    return () => unsubscribe();
  }, []);
};

export const initializeInactivityEffect = (
  user, 
  setShowWarningModal, 
  setCountdown, 
  handleSignOut, 
  setUser, 
  setUserData
) => {
  useEffect(() => {
    if (user) {
      resetInactivityTimer(
        user,
        setShowWarningModal,
        setCountdown,
        handleSignOut,
        setUser,
        setUserData
      );
    }
  }, [user]);
};

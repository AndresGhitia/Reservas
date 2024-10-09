import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { toast } from 'react-toastify';

const showToast = (type, message) => {
  if (type === 'error') {
    toast.error(message);
  } else if (type === 'success') {
    toast.success(message);
  }
};

const validateFields = ({ name, sport, surface, players, rate, openTime, closeTime, techo, walls }) => { 
  if (!name.trim()) {
    return "Debes ingresar un nombre para el espacio";
  }

  if (!sport.trim()) {
    return "Debes seleccionar un deporte para el espacio";
  }

  if (sport === 'Paddle' && (!walls || !['Pared', 'Blindex'].includes(walls))) {
    return "Debes seleccionar si las paredes son 'Pared' o 'Blindex' para Paddle";
  }

  if (!surface || !['Piso', 'Césped Natural', 'Césped Sintético', 'Polvo de ladrillo', 'Arena'].includes(surface)) {
    return "Debes seleccionar una superficie válida";
  }

  if (!players || isNaN(players) || players <= 0) {
    return "Debes ingresar una cantidad válida de jugadores";
  }

  if (!rate || isNaN(rate) || rate <= 0) {
    return "Debes ingresar una tarifa válida";
  }

  if (!openTime || !closeTime) {
    return "Debes ingresar las horas de apertura y cierre";
  }

  if (!techo || !['techada', 'no'].includes(techo)) { // Validar si techo es techada o no
    return "Debes seleccionar si el espacio es techado o al aire libre";
  }

  return null; // Si no hay errores, devuelve null
};


export const handleAddSpace = async (newSpace, setNewSpace, setUniqueError) => {
  const user = auth.currentUser;

  if (!user) {
    console.error("No hay usuario autenticado");
    showToast('error', 'Usuario no autenticado');
    return;
  }

  // Validar los campos antes de proceder
  const validationError = validateFields(newSpace);
  if (validationError) {
    setUniqueError(validationError); // Mostrar error en el componente
    showToast('error', validationError); // Mostrar notificación de error
    return;
  }

  const { name, sport, surface, players, rate, openTime, closeTime, techo, walls } = newSpace;

  try {
    // Verificar si ya existe un espacio con el mismo nombre
    const spacesRef = collection(db, 'owners', user.uid, 'spaces');
    const q = query(spacesRef, where("name", "==", name.trim()));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const errorMessage = "Ya existe un espacio con ese nombre";
      setUniqueError(errorMessage); 
      showToast('error', errorMessage); 
      return;
    }

    // Agregar el espacio con todos los campos en Firestore, incluyendo walls si es Paddle
    await setDoc(doc(db, 'owners', user.uid, 'spaces', name.trim()), {
      name: name.trim(),
      sport: sport,
      surface: surface,
      players: parseInt(players),
      rate: parseFloat(rate),
      openTime: openTime,  
      closeTime: closeTime, 
      roof: techo, 
      walls: sport === 'Paddle' ? walls : null // Solo agregar walls si es Paddle
    });

    // Limpiar los campos del formulario
    setNewSpace({
      name: '',
      sport: '',
      surface: '',
      players: '',
      rate: '',
      openTime: '', 
      closeTime: '', 
      techo: '',
      walls: '', // Limpiar walls
    });

    setUniqueError(null); 
    showToast('success', 'Espacio agregado exitosamente'); 

  } catch (error) {
    console.error("Error al agregar espacio: ", error);
    const errorMessage = "Error al agregar el espacio";
    setUniqueError(errorMessage); 
    showToast('error', errorMessage);
  }
};


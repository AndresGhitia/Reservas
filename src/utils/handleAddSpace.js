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

// Función de validación de los campos
const validateFields = ({ name, sport, surface, players, rate, openTime, closeTime }) => {
  if (!name.trim()) {
    return "Debes ingresar un nombre para el espacio";
  }

  if (!sport.trim()) {
    return "Debes seleccionar un deporte para el espacio";
  }

  if (!surface || !['Piso', 'Césped Natural', 'Césped Sintético'].includes(surface)) {
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

  return null; // Si no hay errores, devuelve null
};

// Función para agregar un nuevo espacio
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

  const { name, sport, surface, players, rate, openTime, closeTime } = newSpace;

  try {
    // Check if space with the same name already exists
    const spacesRef = collection(db, 'owners', user.uid, 'spaces');
    const q = query(spacesRef, where("name", "==", name.trim()));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const errorMessage = "Ya existe un espacio con ese nombre";
      setUniqueError(errorMessage); // Mostrar error en el componente
      showToast('error', errorMessage); // Notificación de error
      return;
    }

    // Agregar el espacio con todos los campos en Firestore, incluyendo openTime y closeTime
    await setDoc(doc(db, 'owners', user.uid, 'spaces', name.trim()), {
      name: name.trim(),
      sport: sport,
      surface: surface,
      players: parseInt(players), // Guardar como número
      rate: parseFloat(rate), // Guardar como número con decimales
      openTime: openTime,  // Guardar la hora de apertura
      closeTime: closeTime // Guardar la hora de cierre
    });

    // Limpiar los campos del formulario
    setNewSpace({
      name: '',
      sport: '',
      surface: '',
      players: '',
      rate: '',
      openTime: '', // Limpiar hora de apertura
      closeTime: '', // Limpiar hora de cierre
    });

    setUniqueError(null); // Limpiar cualquier error previo
    showToast('success', 'Espacio agregado exitosamente'); 

  } catch (error) {
    console.error("Error al agregar espacio: ", error);
    const errorMessage = "Error al agregar el espacio";
    setUniqueError(errorMessage); 
    showToast('error', errorMessage);
  }
};

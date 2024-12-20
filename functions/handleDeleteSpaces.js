import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../src/firebase';
import { toast } from 'react-toastify';

const showToast = (type, message) => {
  if (type === 'error') {
    toast.error(message);
  } else if (type === 'success') {
    toast.success(message);
  }
};

export const handleDeleteSpaces = async (setUniqueError) => {
  const user = auth.currentUser;

  console.log('Funcion Delete')

  if (!user) {
    console.error("No hay usuario autenticado");
    showToast('error', 'Usuario no autenticado');
    return;
  }

  try {
    // Referencia a la colección de espacios del propietario
    const spacesRef = collection(db, 'owners', user.uid, 'spaces');
    const querySnapshot = await getDocs(spacesRef);

    if (querySnapshot.empty) {
      const errorMessage = "No hay espacios para eliminar";
      setUniqueError(errorMessage); // Mostrar error en el componente
      showToast('error', errorMessage); // Mostrar notificación de error
      return;
    }

    // Borrar todos los documentos de la colección 'spaces'
    querySnapshot.forEach(async (docSnapshot) => {
      try {
        // Eliminar documento individual
        await deleteDoc(doc(db, 'owners', user.uid, 'spaces', docSnapshot.id));
      } catch (deleteError) {
        console.error("Error al eliminar el espacio:", deleteError);
        showToast('error', "Hubo un error al eliminar algunos espacios.");
      }
    });

    showToast('success', 'Todos los espacios fueron eliminados exitosamente');
    setUniqueError(null); // Limpiar el error, si hubo alguno

  } catch (error) {
    console.error("Error al obtener los espacios: ", error);
    const errorMessage = "Error al obtener los espacios para eliminar";
    setUniqueError(errorMessage); // Mostrar error en el componente
    showToast('error', errorMessage); // Mostrar notificación de error
  }
};

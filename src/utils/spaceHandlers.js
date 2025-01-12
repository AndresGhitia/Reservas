import Swal from 'sweetalert2';
import { doc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const deleteSpace = async (userId, spaceId) => {
  // Mostrar mensaje de confirmación usando Swal
  const confirmDelete = await Swal.fire({
    title: '¿Estás seguro?',
    text: 'Esta acción eliminará la cancha y todos los datos almacenados.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
  });

  if (!confirmDelete.isConfirmed) {
    return; // Si el usuario cancela, no se realiza la eliminación
  }

  try {
    const spaceDocRef = doc(db, 'owners', userId, 'spaces', spaceId);
    const calendarCollectionRef = collection(spaceDocRef, 'calendar');
    const calendarSnapshot = await getDocs(calendarCollectionRef);

    // Eliminar todos los documentos del calendario
    const deletePromises = calendarSnapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    // Eliminar el documento del espacio
    await deleteDoc(spaceDocRef);

    // Mostrar mensaje de éxito
    await Swal.fire({
      title: '¡Eliminado!',
      text: 'La cancha y todos sus datos fueron eliminados correctamente.',
      icon: 'success',
    });

    return true;
  } catch (error) {
    console.error('Error al borrar el espacio y su calendario: ', error);

    // Mostrar mensaje de error
    await Swal.fire({
      title: 'Error',
      text: 'Ocurrió un error al intentar eliminar la cancha. Por favor, intenta nuevamente.',
      icon: 'error',
    });

    return false;
  }
};

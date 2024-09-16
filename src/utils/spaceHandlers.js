// src/utils/spaceHandlers.js

import { doc, collection, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const deleteSpace = async (userId, spaceId) => {
  const confirmDelete = window.confirm(
    "Estas seguro que deseas eliminar esta cancha? Ten en cuenta que se borrarán todos los datos almacenados!"
  );

  if (!confirmDelete) {
    return; // Si el usuario cancela, no se realiza la eliminación
  }

  try {
    const spaceDocRef = doc(db, 'owners', userId, 'spaces', spaceId);
    const calendarCollectionRef = collection(spaceDocRef, 'calendar');
    const calendarSnapshot = await getDocs(calendarCollectionRef);

    const deletePromises = calendarSnapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);

    await deleteDoc(spaceDocRef);
    return true;
  } catch (error) {
    console.error("Error al borrar el espacio y su calendario: ", error);
    return false;
  }
};

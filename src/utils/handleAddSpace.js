// src/utils/handleAddSpace.js

import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';

export const handleAddSpace = async (newSpaceName, setNewSpaceName, setUniqueError) => {
  const user = auth.currentUser;
  if (!user) {
    console.error("No hay usuario autenticado");
    return;
  }

  if (!newSpaceName.trim()) {
    setUniqueError("Debes ingresar un nombre para el espacio");
    return;
  }

  // Check if space with the same name already exists
  const spacesRef = collection(db, 'owners', user.uid, 'spaces');
  const q = query(spacesRef, where("name", "==", newSpaceName.trim()));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    setUniqueError("Ya existe un espacio con ese nombre");
    return;
  }

  try {
    await addDoc(spacesRef, { name: newSpaceName.trim() });
    setNewSpaceName(""); // Clear input
    setUniqueError(null); // Clear any previous errors
  } catch (error) {
    console.error("Error al agregar espacio: ", error);
    setUniqueError("Error al agregar el espacio");
  }
};

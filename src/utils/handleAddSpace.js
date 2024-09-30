// src/utils/handleAddSpace.js

import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';

// Función para agregar un nuevo espacio
export const handleAddSpace = async (newSpace, setNewSpace, setUniqueError) => {
  const user = auth.currentUser;

  if (!user) {
    console.error("No hay usuario autenticado");
    return;
  }

  const { name, surface, players, rate } = newSpace;

  if (!name.trim()) {
    setUniqueError("Debes ingresar un nombre para el espacio");
    return;
  }

  if (!surface || !['Piso', 'Césped Natural', 'Césped Sintético'].includes(surface)) {
    setUniqueError("Debes seleccionar una superficie válida");
    return;
  }

  if (!players || isNaN(players) || players <= 0) {
    setUniqueError("Debes ingresar una cantidad válida de jugadores");
    return;
  }

  if (!rate || isNaN(rate) || rate <= 0) {
    setUniqueError("Debes ingresar una tarifa válida");
    return;
  }

  // Check if space with the same name already exists
  const spacesRef = collection(db, 'owners', user.uid, 'spaces');
  const q = query(spacesRef, where("name", "==", name.trim()));
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    setUniqueError("Ya existe un espacio con ese nombre");
    return;
  }

  try {
    // Agregar el espacio con todos los campos en Firestore
    await setDoc(doc(db, 'owners', user.uid, 'spaces', name.trim()), {
      name: name.trim(),
      surface: surface,
      players: parseInt(players), // Guardar como número
      rate: parseFloat(rate), // Guardar como número con decimales
    });

    // Limpiar los campos del formulario
    setNewSpace({
      name: '',
      surface: '',
      players: '',
      rate: '',
    });

    setUniqueError(null); // Limpiar cualquier error previo
  } catch (error) {
    console.error("Error al agregar espacio: ", error);
    setUniqueError("Error al agregar el espacio");
  }
};

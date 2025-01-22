import { collection, addDoc, doc, deleteDoc,setDoc } from "firebase/firestore";
import { db } from "../../firebase";

export const handleAddItemToStore = async (ownerId, category, item) => {
    try {
      const categoryRef = doc(db, `owners/${ownerId}/store/${category}`);
  
      await setDoc(categoryRef, {
        items: [...(categoryRef.items || []), item],  
      }, { merge: true });
  
      console.log("Ítem agregado correctamente");
    } catch (error) {
      console.error("Error al agregar el ítem:", error);
      throw error;
    }
  };
export const deleteItemFromStore = async (ownerId, category, itemId) => {
  console.log("Inicio de deleteItemFromStore");
  console.log("Parámetros recibidos:", { ownerId, category, itemId });

  if (!ownerId) {
    console.error("Error: ownerId no está definido.");
    throw new Error("ownerId no está definido");
  }

  if (!category) {
    console.error("Error: category no está definida.");
    throw new Error("category no está definida");
  }

  if (!itemId) {
    console.error("Error: itemId no está definido.");
    throw new Error("itemId no está definido");
  }

  try {
    console.log(`Creando referencia al documento: owners/${ownerId}/store/${category}/${itemId}`);
    const itemRef = doc(db, `owners/${ownerId}/store/${category}/${itemId}`);

    console.log("Eliminando documento...");
    await deleteDoc(itemRef);

    console.log("Ítem eliminado exitosamente. ID del ítem:", itemId);
  } catch (error) {
    console.error("Error en deleteItemFromStore:", error);
    throw error;
  }
};

export const handleAddSpace = async () => {
    if (newSpaceName.trim() === "") {
      setInputError(true);  // Si está vacío, marca el input como incorrecto
      return;
    }
  
    setUniqueError(null);
    setInputError(false);  // Restablece el error si hay un valor correcto
  
    try {
      const user = auth.currentUser;
      if (user) {
        const spacesRef = collection(db, 'owners', user.uid, 'spaces');
        const q = query(spacesRef, where("name", "==", newSpaceName));
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
          setUniqueError("Ya existe un espacio con este nombre.");
        } else {
          const docRef = await addDoc(spacesRef, { name: newSpaceName });
          setSpaces(prevSpaces => [...prevSpaces, { id: docRef.id, name: newSpaceName }]);
          setNewSpaceName("");
        }
      }
    } catch (error) {
      console.error("Error al agregar un nuevo espacio: ", error);
    }
  };
  
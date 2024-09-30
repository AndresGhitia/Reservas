import { auth, db } from '../firebase'; 
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

export const fetchOwnerDataAndSpaces = async (setOwnerData, setSpaces, setError, setLoading) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const docRef = doc(db, 'owners', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setOwnerData(docSnap.data());

        const spacesRef = collection(docRef, 'spaces');
        const spacesSnap = await getDocs(spacesRef);
        const spacesList = spacesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSpaces(spacesList);
      } else {
        setError("No se encontraron datos del propietario.");
      }
    } else {
      setError("Usuario no autenticado.");
    }
  } catch (error) {
    console.error("Error al obtener los datos del propietario: ", error);
    setError("Hubo un error al cargar los datos.");
  } finally {
    setLoading(false);
  }
};

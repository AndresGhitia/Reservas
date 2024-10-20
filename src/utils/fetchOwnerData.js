import { auth, db } from '../firebase'; 
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';

export const fetchOwnerDataAndSpaces = async (setOwnerData, setSpaces, setError, setLoading) => {
  try {
    console.log("Iniciando fetchOwnerDataAndSpaces...");
    const user = auth.currentUser;
    if (user) {
      console.log("Usuario autenticado:", user);
      const docRef = doc(db, 'owners', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        console.log("Datos del propietario encontrados:", docSnap.data());
        setOwnerData(docSnap.data());

        const spacesRef = collection(docRef, 'spaces');
        const spacesSnap = await getDocs(spacesRef);
        const spacesList = spacesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log("Espacios encontrados:", spacesList);
        setSpaces(spacesList);
      } else {
        console.log("No se encontraron datos del propietario.");
        setError("No se encontraron datos del propietario.");
      }
    } else {
      console.log("Usuario no autenticado.");
      setError("Usuario no autenticado.");
    }
  } catch (error) {
    console.error("Error al obtener los datos del propietario: ", error);
    setError("Hubo un error al cargar los datos.");
  } finally {
    setLoading(false);
  }
};

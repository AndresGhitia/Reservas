import { auth, db } from '../src/firebase';
import { doc, deleteDoc, collection, getDocs } from 'firebase/firestore';

const onDeleteAccount = async (userCollection) => {
  try {
    const user = auth.currentUser; // Obtener el usuario autenticado
    console.log('Usuario autenticado:', user ? user.uid : 'No hay usuario autenticado');

    if (user) {
      const documentId = user.uid;
      console.log(`Intentando eliminar documento en Firestore: ${userCollection}/${documentId}`);

      // Eliminar datos relacionados al usuario en Firestore
      await deleteUserRelatedData(documentId);

      // Deshabilitar la cuenta en el backend
      console.log('Deshabilitando la cuenta en backend...');
      const response = await fetch('https://deleteuseraccount-a6vhaqpb7a-uc.a.run.app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: await user.getIdToken(), // Obtén el ID Token del usuario
        }),
      });
      if (!response.ok) {
        throw new Error('Error al deshabilitar la cuenta en el backend.');
      }
      const result = await response.json();
      console.log('Cuenta deshabilitada exitosamente:', result.message);

      alert('Cuenta eliminada y deshabilitada con éxito.');
    } else {
      console.log('No hay usuario autenticado.');
      alert('No hay usuario autenticado.');
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    alert('Hubo un error al intentar eliminar la cuenta. Intenta de nuevo.');
  }
};

// Función para eliminar datos relacionados con el usuario en Firestore
const deleteUserRelatedData = async (userId) => {
  try {
    const userRef = doc(db, 'owners', userId); // Referencia a la colección 'owners'
    const spacesRef = collection(db, `owners/${userId}/spaces`);
    
    // Obtener y eliminar espacios
    const spacesSnapshot = await getDocs(spacesRef);
    spacesSnapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
      console.log(`Espacio ${doc.id} eliminado.`);
      
      // Eliminar subcolección schedules si existe
      const schedulesRef = collection(db, `owners/${userId}/spaces/${doc.id}/schedules`);
      const schedulesSnapshot = await getDocs(schedulesRef);
      schedulesSnapshot.forEach(async (scheduleDoc) => {
        await deleteDoc(scheduleDoc.ref);
        console.log(`Horario ${scheduleDoc.id} eliminado.`);
      });
    });
    
    // Eliminar el documento principal del usuario
    await deleteDoc(userRef);
    console.log('Documento de usuario eliminado.');
  } catch (error) {
    console.error('Error al eliminar los datos del usuario:', error);
  }
};

export default onDeleteAccount;

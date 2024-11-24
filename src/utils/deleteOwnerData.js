    import { deleteDoc, doc, collection, getDocs } from "firebase/firestore";
    import { deleteUser } from "firebase/auth";
    import { auth, db } from '../firebase';

    export const deleteOwnerData = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          throw new Error("Usuario no autenticado.");
        }

        const ownerId = user.uid;

        // 1. Eliminar el documento principal del Owner
        const ownerDocRef = doc(db, "owners", ownerId);
        await deleteDoc(ownerDocRef);

        // 2. Eliminar subcolecciones relacionadas
        const spacesCollectionRef = collection(db, `owners/${ownerId}/spaces`);
        const spacesSnapshot = await getDocs(spacesCollectionRef);

        for (const spaceDoc of spacesSnapshot.docs) {
          const spaceId = spaceDoc.id;

          // Subcolección de horarios
          const schedulesCollectionRef = collection(db, `owners/${ownerId}/spaces/${spaceId}/schedules`);
          const schedulesSnapshot = await getDocs(schedulesCollectionRef);

          for (const scheduleDoc of schedulesSnapshot.docs) {
            const scheduleDocRef = doc(db, `owners/${ownerId}/spaces/${spaceId}/schedules`, scheduleDoc.id);
            await deleteDoc(scheduleDocRef);
          }

          // Eliminar espacio
          const spaceDocRef = doc(db, `owners/${ownerId}/spaces`, spaceId);
          await deleteDoc(spaceDocRef);
        }

        // 3. Eliminar la cuenta del usuario
        await deleteUser(user);

        console.log("Datos y cuenta del propietario eliminados correctamente.");
      } catch (error) {
        console.error("Error al eliminar los datos del propietario:", error);
        throw error;
      }
    };

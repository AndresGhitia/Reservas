const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

if (!admin.apps.length) {
  admin.initializeApp();
}

// Función para eliminar una colección y sus subcolecciones
async function deleteCollectionAndSubcollections(collectionRef) {
  const snapshot = await collectionRef.get();

  for (const doc of snapshot.docs) {
    // Eliminar subcolecciones del documento
    const subcollections = await doc.ref.listCollections();
    for (const subcollection of subcollections) {
      console.log(`Eliminando subcolección: ${subcollection.id}`);
      await deleteCollectionAndSubcollections(subcollection);
    }

    // Eliminar el documento
    console.log(`Eliminando documento: ${doc.id}`);
    await doc.ref.delete();
  }
}

exports.deleteUserAccount = onRequest((req, res) => {
  console.log("La función deleteUserAccount ha sido invocada");
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        console.log("Método no permitido.");
        return res.status(405).send({ error: "Método no permitido" });
      }

      const { idToken } = req.body;
      console.log("Recibido token para verificación.");
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const clientId = decodedToken.uid;
      console.log(`ID verificado: ${clientId}`);

      const ownerDocRef = admin.firestore().doc(`owners/${clientId}`);
      const ownerDoc = await ownerDocRef.get();

      if (ownerDoc.exists) {
        console.log(`Usuario encontrado en 'owners' con ID: ${clientId}`);

        // Eliminar documentos y subcolecciones en 'spaces'
        const spacesCollectionRef = admin.firestore().collection(`owners/${clientId}/spaces`);
        console.log(`Eliminando colección 'spaces' para el ownerId: ${clientId}`);
        await deleteCollectionAndSubcollections(spacesCollectionRef);
        console.log(`Colección 'spaces' eliminada correctamente.`);

        // Eliminar documentos y subcolecciones en 'store'
        const storeCollectionRef = admin.firestore().collection(`owners/${clientId}/store`);
        console.log(`Eliminando colección 'store' para el ownerId: ${clientId}`);
        await deleteCollectionAndSubcollections(storeCollectionRef);
        console.log(`Colección 'store' eliminada correctamente.`);

        // Actualizar datos en 'owners'
        await ownerDocRef.update({
          address: "",
          businessType: "",
          establishmentName: "",
          expdate: "",
          ownerName: "",
          whatsapp: "",
          backgroundImageUrl: "https://res.cloudinary.com/dbrz9aqlt/image/upload/v1728674945/qnx79wojyp0ypmlxofcf.jpg",
          status: "disabled",
          amenities: [],
          news: [],
          statusHistory: admin.firestore.FieldValue.arrayUnion({
            disabled: new Date().toISOString(),
          }),
        });
        console.log(`Datos del owner actualizados correctamente.`);
      } else {
        console.log(`No encontrado en 'owners'. Verificando en 'users'.`);
        const userDocRef = admin.firestore().doc(`users/${clientId}`);
        const userDoc = await userDocRef.get();

        if (userDoc.exists) {
          console.log(`Usuario encontrado en 'users' con ID: ${clientId}`);
          await userDocRef.update({
            firstName: "",
            lastName: "",
            status: "disabled",
            statusHistory: admin.firestore.FieldValue.arrayUnion({
              disabled: new Date().toISOString(),
            }),
          });
          console.log(`Datos del usuario en 'users' actualizados correctamente.`);
        } else {
          console.log(`Usuario no encontrado ni en 'owners' ni en 'users'.`);
          return res.status(404).send({ error: "Usuario no encontrado." });
        }
      }

      console.log("Proceso completado exitosamente.");
      return res.status(200).send({ message: "Cuenta deshabilitada y datos actualizados correctamente." });
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      return res.status(500).send({ error: "Error interno al procesar la solicitud." });
    }
  });
});

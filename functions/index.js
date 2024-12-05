const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

if (!admin.apps.length) {
  admin.initializeApp();
}

exports.deleteUserAccount = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      // Verifica el método de la solicitud
      if (req.method !== "POST") {
        return res.status(405).send({ error: "Método no permitido" });
      }

      const { idToken } = req.body;

      // Verifica el token del usuario
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const ownerId = decodedToken.uid;

      // Referencia al documento del usuario
      const ownerDocRef = admin.firestore().doc(`owners/${ownerId}`);
      const spacesCollectionRef = admin.firestore().collection(`owners/${ownerId}/spaces`);

      const spacesSnapshot = await spacesCollectionRef.get();
      for (const spaceDoc of spacesSnapshot.docs) {
        const schedulesCollectionRef = admin
          .firestore()
          .collection(`owners/${ownerId}/spaces/${spaceDoc.id}/schedules`);

        const schedulesSnapshot = await schedulesCollectionRef.get();
        for (const scheduleDoc of schedulesSnapshot.docs) {
          await scheduleDoc.ref.delete();
        }
        await spaceDoc.ref.delete();
      }

      // Actualizar los datos del usuario en lugar de eliminar el documento
      await ownerDocRef.update({
        address:"",
        businessType: "", // Poner en blanco
        establishmentEmail: "", // Poner en blanco
        establishmentName: "", // Poner en blanco
        expdate: "", // Poner en blanco
        ownerName: "", // Poner en blanco
        whatsapp: "", // Poner en blanco
        status: "disabled", // Cambiar a "disabled"
        statusHistory: admin.firestore.FieldValue.arrayUnion({
          disabled: new Date().toISOString(), // Agregar el timestamp de deshabilitación
        }),
      });


    //  await admin.auth().deleteUser(ownerId);

      return res.status(200).send({ message: "Cuenta deshabilitada y datos actualizados correctamente." });
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      return res.status(500).send({ error: "Error interno al procesar la solicitud." });
    }
  });
});

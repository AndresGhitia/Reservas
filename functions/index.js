const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });
const deleteCollection = require('./deleteCollection');
// const { default: News } = require("../src/pages/Dashboard/News/News");

if (!admin.apps.length) {
  admin.initializeApp();
}

exports.deleteUserAccount = onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).send({ error: "Método no permitido" });
      }

      const { idToken } = req.body;
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      const ownerId = decodedToken.uid;

      const ownerDocRef = admin.firestore().doc(`owners/${ownerId}`);
      const spacesCollectionRef = admin.firestore().collection(`owners/${ownerId}/spaces`);

      console.log(`Obteniendo documentos de la colección spaces para ownerId: ${ownerId}`);

      // Agregar log aquí para asegurar que la colección sea obtenida correctamente
      const spacesSnapshot = await spacesCollectionRef.get();
      console.log(`Se encontraron ${spacesSnapshot.size} documentos en spaces.`);

      console.log(`Eliminando documentos de la colección spaces para ownerId: ${ownerId}`);
      await deleteCollection(spacesCollectionRef);
      console.log(`spacesCollectionRef: `+ JSON.stringify(spacesCollectionRef));

      console.log(`Todos los documentos de spaces eliminados correctamente.`);

      console.log(`Todos los documentos y subcolecciones eliminados correctamente para ownerId: ${ownerId}`);

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

      return res.status(200).send({ message: "Cuenta deshabilitada y datos actualizados correctamente." });
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      return res.status(500).send({ error: "Error interno al procesar la solicitud." });
    }
  });
});

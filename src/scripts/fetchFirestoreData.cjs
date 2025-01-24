const admin = require("firebase-admin");
const serviceAccount = require("./service-account-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

const getAllCollections = async (db) => {
  const collections = await db.listCollections();
  const data = {};

  for (const collection of collections) {
    const collectionData = [];
    const snapshot = await collection.get();

    for (const doc of snapshot.docs) {
      const docData = doc.data();
      docData.id = doc.id; 
      collectionData.push(docData);

      // Obtener subcolecciones
      const subcollections = await doc.ref.listCollections();
      for (const subcollection of subcollections) {
        const subData = [];
        const subSnapshot = await subcollection.get();

        for (const subDoc of subSnapshot.docs) {
          const subDocData = subDoc.data();
          subDocData.id = subDoc.id; // Incluir el ID del documento
          subData.push(subDocData);
        }
        docData[subcollection.id] = subData;
      }
    }

    data[collection.id] = collectionData;
  }
  return data;
};

(async () => {
  try {
    const data = await getAllCollections(db);
    console.log("Firestore Data:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error fetching Firestore data:", error);
  }
})();

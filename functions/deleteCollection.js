const admin = require("firebase-admin");

async function deleteCollection(collectionRef) {
  const snapshot = await collectionRef.get();
  
  if (snapshot.empty) {
    return;
  }

  const batch = admin.firestore().batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
}

module.exports = deleteCollection; 

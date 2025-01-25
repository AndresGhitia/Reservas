const admin = require("firebase-admin");

/**
 * Elimina todos los documentos de una colección, incluyendo sus subcolecciones.
 * @param {FirebaseFirestore.CollectionReference} collectionRef - Referencia a la colección.
 */
async function deleteCollectionAndSubcollections(collectionRef) {
  console.log(`Iniciando eliminación de la colección: ${collectionRef.path}`);
  try {
    const snapshot = await collectionRef.get();
    console.log(`Snapshot para ${collectionRef.path}: ${snapshot.size} documentos encontrados`);

    if (snapshot.empty) {
      console.log(`La colección ${collectionRef.path} ya está vacía.`);
      return;
    }

    for (const doc of snapshot.docs) {
      console.log(`Procesando documento ${doc.id} en ${collectionRef.path}`);
      const subcollections = await doc.ref.listCollections();
      console.log(`Subcolecciones encontradas para ${doc.id}: ${subcollections.map(s => s.id).join(", ")}`);

      for (const subcollection of subcollections) {
        console.log(`Eliminando subcolección ${subcollection.id} en documento ${doc.id}`);
        await deleteCollectionAndSubcollections(subcollection);
      }

      console.log(`Eliminando documento ${doc.id}`);
      await doc.ref.delete();
    }
  } catch (error) {
    console.error(`Error al eliminar la colección ${collectionRef.path}:`, error);
  }
}


module.exports = deleteCollectionAndSubcollections;

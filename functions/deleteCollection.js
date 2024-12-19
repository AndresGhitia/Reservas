const admin = require("firebase-admin");

async function deleteCollection(collectionRef) {
  const snapshot = await collectionRef.get();
  
  console.log(`Obteniendo documentos de la colección ${collectionRef.path}, número de documentos: ${snapshot.size}`);
  
  // Si no hay documentos, no hacemos nada.
  if (snapshot.empty) {
    console.log('La colección está vacía, no se eliminaron documentos.');
    return;
  }

  // Creamos un batch para manejar las eliminaciones de documentos.
  const batch = admin.firestore().batch();

  snapshot.docs.forEach(doc => {
    console.log(`Agregando documento ${doc.id} al batch para eliminación.`);
    batch.delete(doc.ref);
  });

  // Ejecutamos la eliminación en batch.
  console.log('Ejecutando el commit para eliminar los documentos.');
  await batch.commit();
  console.log('Eliminación de documentos en batch completada.');

  // Si hay más documentos para eliminar (por ejemplo, si Firestore tiene más de 500 documentos por página),
  // llamamos nuevamente a la función para manejar la paginación.
  if (snapshot.size >= 500) {
    const lastVisible = snapshot.docs[snapshot.docs.length - 1];
    console.log(`Hay más de 500 documentos, obteniendo la siguiente página después del documento ${lastVisible.id}.`);
    const nextSnapshot = await collectionRef.startAfter(lastVisible).get();
    console.log('Llamando recursivamente para eliminar más documentos si es necesario.');
    await deleteCollection(nextSnapshot);
  }
}

module.exports = deleteCollection;


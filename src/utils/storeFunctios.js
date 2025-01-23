// storeHelpers.js
import { doc, collection, getDocs, addDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export const fetchItems = async (setItems, setSalesData, setLoading, setError, salesRange) => {
    setLoading(true);
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("Usuario no autenticado.");

        const categories = ["bebidas", "buffet", "tienda"];
        const itemsByCategory = {};
        const salesByCategory = {};
        const today = new Date().toISOString().split("T")[0];
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const thirtyDaysAgoString = thirtyDaysAgo.toISOString().split("T")[0];

        for (const category of categories) {
            const categoryRef = collection(db, `owners/${user.uid}/store/${category}/items`);
            const categorySnap = await getDocs(categoryRef);

            itemsByCategory[category] = [];
            salesByCategory[category] = [];

            for (const docItem of categorySnap.docs) {
                const item = { id: docItem.id, ...docItem.data() };
                itemsByCategory[category].push(item);

                const salesRef = collection(db, `owners/${user.uid}/store/${category}/items/${docItem.id}/ventas`);
                const salesSnap = await getDocs(salesRef);

                const allSales = salesSnap.docs.map((doc) => doc.data());

                let filteredSales = [];
                if (salesRange === "today") {
                    filteredSales = allSales.filter((sale) => sale.date === today);
                } else if (salesRange === "last30") {
                    filteredSales = allSales.filter((sale) => sale.date >= thirtyDaysAgoString);
                }

                const totalSales = filteredSales.reduce((total, sale) => total + (sale.cantidad || 0), 0);
                salesByCategory[category].push({
                    item,
                    sales: totalSales,
                    precio: item.precio,
                });
            }
        }

        setItems(itemsByCategory);
        setSalesData(salesByCategory);
    } catch (err) {
        console.error("Error al obtener los datos:", err);
        setError(err.message);
    } finally {
        setLoading(false);
    }
};

 export const handleSubmit = async (e, category) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuario no autenticado.");

      const itemsRef = collection(db, `owners/${user.uid}/store/${category}/items`);
      await addDoc(itemsRef, {
        nombre: newItem[category]?.nombre || "",
        precio: parseFloat(newItem[category]?.precio || 0),
        stock: parseInt(newItem[category]?.stock || 0, 10),
      });

      setNewItem((prev) => ({ ...prev, [category]: { nombre: "", precio: "", stock: "" } }));
      fetchItems();
    } catch (err) {
      console.error("Error al agregar el ítem:", err);
    }
  };

 export  const handleStockChange = (category, itemId, change) => {
    setItems((prevItems) => {
      const updatedCategory = prevItems[category].map((item) => {
        if (item.id === itemId) {
          return { ...item, stock: Math.max(item.stock + change, 0) };
        }
        return item;
      });

      return { ...prevItems, [category]: updatedCategory };
    });

    if (debounceTimers[itemId]) clearTimeout(debounceTimers[itemId]);

    debounceTimers[itemId] = setTimeout(async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("Usuario no autenticado.");

        const itemRef = doc(db, `owners/${user.uid}/store/${category}/items/${itemId}`);
        await updateDoc(itemRef, { stock: Math.max(0, items[category].find((item) => item.id === itemId).stock + change) });

        console.log("Stock actualizado en Firestore.");
      } catch (err) {
        console.error("Error al actualizar el stock:", err);
      }
    }, 1000);
  };

  export const handleDelete = async (category, itemId) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuario no autenticado.");
  
      // Referencia al documento del ítem
      const itemRef = doc(db, `owners/${user.uid}/store/${category}/items/${itemId}`);
      // Referencia a la colección de ventas del ítem
      const salesCollectionRef = collection(itemRef, "ventas");
  
      // Obtener todas las ventas relacionadas
      const salesSnapshot = await getDocs(salesCollectionRef);
      const deletePromises = [];
  
      salesSnapshot.forEach((saleDoc) => {
        const saleDocRef = doc(salesCollectionRef, saleDoc.id);
        deletePromises.push(deleteDoc(saleDocRef)); // Agregar la promesa de eliminar cada documento de venta
      });
  
      // Esperar a que todas las ventas sean eliminadas
      await Promise.all(deletePromises);
  
      // Eliminar el artículo después de borrar sus ventas
      await deleteDoc(itemRef);
  
      // Actualizar el estado local para reflejar el cambio
      setItems((prevItems) => {
        const updatedCategory = prevItems[category].filter((item) => item.id !== itemId);
        return { ...prevItems, [category]: updatedCategory };
      });
  
      console.log("Ítem y ventas relacionadas eliminados correctamente.");
    } catch (err) {
      console.error("Error al eliminar el ítem y sus ventas:", err);
    }
  };
  
 export const handleRegisterSale = async (category, itemId, quantity) => {
    if (quantity <= 0) return; // Evitar cantidades inválidas.
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuario no autenticado.");
  
      // Obtener la fecha actual en formato YYYY-MM-DD
      const today = new Date().toISOString().split("T")[0];
  
      // Referencias en Firestore
      const itemRef = doc(db, `owners/${user.uid}/store/${category}/items/${itemId}`);
      const salesCollectionRef = collection(itemRef, "ventas");
  
      // Buscar si ya existe un documento para la fecha actual
      const salesQuery = await getDocs(salesCollectionRef);
      let saleDocId = null;
      let currentQuantity = 0;
  
      salesQuery.forEach((doc) => {
        const saleData = doc.data();
        if (saleData.date === today) {
          saleDocId = doc.id; // Guardar el ID del documento existente
          currentQuantity = saleData.cantidad; // Guardar la cantidad actual
        }
      });
  
      if (saleDocId) {
        // Actualizar el documento existente
        const saleDocRef = doc(salesCollectionRef, saleDocId);
        await updateDoc(saleDocRef, { cantidad: currentQuantity + quantity });
      } else {
        // Crear un nuevo documento para la fecha actual
        await addDoc(salesCollectionRef, {
          date: today,
          cantidad: quantity,
        });
      }
  
      // Reducir el stock en Firestore
      const item = items[category].find((item) => item.id === itemId);
      const newStock = Math.max(item.stock - quantity, 0);
      await updateDoc(itemRef, { stock: newStock });
  
      // Actualizar el estado
      setItems((prevItems) => {
        const updatedCategory = prevItems[category].map((item) => {
          if (item.id === itemId) {
            return { ...item, stock: newStock };
          }
          return item;
        });
  
        return { ...prevItems, [category]: updatedCategory };
      });
  
      console.log("Venta registrada y stock actualizado.");
    } catch (err) {
      console.error("Error al registrar la venta:", err);
    }
  };

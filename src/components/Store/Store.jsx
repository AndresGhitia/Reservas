import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { doc, collection, getDocs, addDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { MdAdd, MdRemove, MdEdit } from "react-icons/md";
import "./Store.css";

const Store = () => {
  const [items, setItems] = useState({});
  const [newItem, setNewItem] = useState({});
  const [showForm, setShowForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const debounceTimers = {};

  const fetchItems = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuario no autenticado.");

      const categories = ["bebidas", "buffet", "tienda"];
      const itemsByCategory = {};

      for (const category of categories) {
        const categoryRef = collection(db, `owners/${user.uid}/store/${category}/items`);
        const categorySnap = await getDocs(categoryRef);

        itemsByCategory[category] = categorySnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }

      setItems(itemsByCategory);
    } catch (err) {
      console.error("Error al obtener los datos:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSubmit = async (e, category) => {
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

  const handleStockChange = (category, itemId, change) => {
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

  const handleDelete = async (category, itemId) => {
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
  
  const handleRegisterSale = async (category, itemId, quantity) => {
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
  
  

  const toggleForm = (category) => {
    setShowForm((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  if (loading) return <p className="loading">Cargando...</p>;
  if (error) return <p className="error">Error: {error}</p>;

  return (
    <div className="store-container">
      {Object.keys(items).map((category) => (
        <div key={category} className="store-column">
          <h2 className="category-title">{category.toUpperCase()}</h2>
          <div className="store-items">
            <div className="store-header">
              <span>Artículo</span>
              <span>Precio</span>
              <span>Stock</span>
            </div>
            {items[category].map((item) => (
              <div key={item.id} className="store-item">
                <span>{item.nombre}</span>
                <span>${item.precio}</span>
               
                <div className="stock-controls">
                  <button className="stock-button" onClick={() => handleStockChange(category, item.id, -1)}>-</button>
                  <span>{item.stock}</span>
                  <button className="stock-button" onClick={() => handleStockChange(category, item.id, 1)}>+</button>

                  <button
      className="sale-button"
      onClick={() => handleRegisterSale(category, item.id, 1)} // 1 es la cantidad vendida por defecto.
    >
      Registrar Venta
    </button>
                  
                </div>
                <button className="remove-button" onClick={() => handleDelete(category, item.id)}>x</button>
              </div>
            ))}
          </div>
          <button className="add-item-button" onClick={() => toggleForm(category)}>
            + Agregar
          </button>
          {showForm[category] && (
            <form onSubmit={(e) => handleSubmit(e, category)} className="add-item-form">
              <input
                type="text"
                placeholder="Nombre del ítem"
                value={newItem[category]?.nombre || ""}
                onChange={(e) =>
                  setNewItem((prev) => ({
                    ...prev,
                    [category]: { ...prev[category], nombre: e.target.value },
                  }))
                }
                required
              />
              <input
                type="number"
                placeholder="Precio"
                value={newItem[category]?.precio || ""}
                onChange={(e) =>
                  setNewItem((prev) => ({
                    ...prev,
                    [category]: { ...prev[category], precio: e.target.value },
                  }))
                }
                required
              />
              <input
                type="number"
                placeholder="Stock"
                value={newItem[category]?.stock || ""}
                onChange={(e) =>
                  setNewItem((prev) => ({
                    ...prev,
                    [category]: { ...prev[category], stock: e.target.value },
                  }))
                }
                required
              />
              <button type="submit" className="submit-button">Guardar</button>
            </form>
          )}
        </div>
      ))}
    </div>
  );
};

export default Store;

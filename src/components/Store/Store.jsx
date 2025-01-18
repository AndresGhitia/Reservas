import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { doc, collection, getDocs, addDoc, deleteDoc, updateDoc } from "firebase/firestore";
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
      console.log("Ítem agregado correctamente.");
      fetchItems();
    } catch (err) {
      console.error("Error al agregar el ítem:", err);
    }
  };

  const handleStockChange = (category, itemId, change) => {
    setItems((prevItems) => {
      const updatedCategory = prevItems[category].map((item) => {
        if (item.id === itemId) {
          return { ...item, stock: Math.max(item.stock + change, 0) }; // Evitar stock negativo
        }
        return item;
      });
  
      return { ...prevItems, [category]: updatedCategory };
    });
  
    // Guardar el nuevo stock local para evitar problemas con la referencia a `items`
    const updatedItem = items[category]?.find((item) => item.id === itemId);
    const newStock = (updatedItem?.stock || 0) + change;
  
    if (debounceTimers[itemId]) clearTimeout(debounceTimers[itemId]);
  
    debounceTimers[itemId] = setTimeout(async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("Usuario no autenticado.");
  
        const itemRef = doc(db, `owners/${user.uid}/store/${category}/items/${itemId}`);
        await updateDoc(itemRef, { stock: Math.max(newStock, 0) });
  
        console.log("Stock actualizado en Firestore.");
      } catch (err) {
        console.error("Error al actualizar el stock:", err);
      }
    }, 1000); // Esperar 1 segundo después de la última acción
  };
  

  const handleDelete = async (category, itemId) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Usuario no autenticado.");

      const itemRef = doc(db, `owners/${user.uid}/store/${category}/items/${itemId}`);
      await deleteDoc(itemRef);

      setItems((prevItems) => {
        const updatedCategory = prevItems[category].filter((item) => item.id !== itemId);
        return { ...prevItems, [category]: updatedCategory };
      });

      console.log("Ítem eliminado correctamente.");
    } catch (err) {
      console.error("Error al eliminar el ítem:", err);
    }
  };

  const toggleForm = (category) => {
    setShowForm((prev) => ({ ...prev, [category]: !prev[category] }));
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="store-container">
      {Object.keys(items).map((category) => (
        <div key={category} className="store-column">
          <h2>{category.toUpperCase()}</h2>
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
                  <button onClick={() => handleStockChange(category, item.id, -1)}>-</button>
                  <span>{item.stock}</span>
                  <button onClick={() => handleStockChange(category, item.id, 1)}>+</button>
                </div>
                <button onClick={() => handleDelete(category, item.id)}>Eliminar</button>
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
              <button type="submit">Guardar</button>
            </form>
          )}
        </div>
      ))}
    </div>
  );
};

export default Store;


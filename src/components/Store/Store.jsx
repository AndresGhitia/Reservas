import React, { useState, useEffect } from "react";
import { auth, db } from "../../firebase";
import { doc, collection, getDocs, addDoc, deleteDoc } from "firebase/firestore";
import './Store.css';

const Store = () => {
  const [items, setItems] = useState({});
  const [newItem, setNewItem] = useState({});
  const [showForm, setShowForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Función para obtener los datos de Firestore
  const fetchItems = async () => {
    setLoading(true); // Mostrar el estado de carga al comenzar
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

      setItems(itemsByCategory); // Actualizar el estado con los datos obtenidos
    } catch (err) {
      console.error("Error al obtener los datos:", err);
      setError(err.message);
    } finally {
      setLoading(false); // Ocultar el estado de carga al finalizar
    }
  };

  // Obtener datos al cargar el componente
  useEffect(() => {
    fetchItems();
  }, []);

  // Manejar el envío de un nuevo artículo
  const handleSubmit = async (e, category) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (!user) {
      console.error("Usuario no autenticado");
      return;
    }

    try {
      const itemsRef = collection(db, `owners/${user.uid}/store/${category}/items`);
      await addDoc(itemsRef, {
        nombre: newItem[category]?.nombre || "",
        precio: parseFloat(newItem[category]?.precio || 0),
        stock: parseInt(newItem[category]?.stock || 0, 10),
      });

      setNewItem((prev) => ({ ...prev, [category]: { nombre: "", precio: "", stock: "" } }));
      console.log("Ítem agregado correctamente.");
      fetchItems(); // Volver a obtener los datos actualizados
    } catch (err) {
      console.error("Error al agregar el ítem:", err);
    }
  };

  // Manejar la eliminación de un artículo
  const handleDelete = async (category, itemId) => {
    try {
      const itemRef = doc(db, `owners/${auth.currentUser.uid}/store/${category}/items/${itemId}`);
      await deleteDoc(itemRef);
      console.log("Ítem eliminado correctamente.");
      fetchItems(); // Volver a obtener los datos actualizados
    } catch (err) {
      console.error("Error al eliminar el ítem:", err);
    }
  };

  // Alternar el formulario de añadir ítems
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
                <span>{item.stock}</span>
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

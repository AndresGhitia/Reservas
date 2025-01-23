import './Stock.css';

const Stock = ({
  category,
  items,
  searchTerm,
  setSearchTerm,
  handleStockChange,
  handleRegisterSale,
  handleDelete,
  formatCurrency,
  toggleForm,
  handleSubmit,
  newItem,
  setNewItem,
  showForm,
}) => {
  // Validar que items[category] sea un arreglo
  const filteredItems = Array.isArray(items)
    ? items
        .filter((item) =>
          item.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => a.nombre.localeCompare(b.nombre)) // Ordena alfabéticamente
    : [];

  return (
    <div className="stock-container">
      {/* Encabezado con buscador */}
      <div className="store-header">
        <span>Artículo</span>
        <span>Precio</span>
        <span>Stock</span>
        <input
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Lista de artículos filtrados y ordenados */}
      <div className="store-items">
        {filteredItems.map((item) => (
          <div key={item.id} className="store-item">
            <span>{item.nombre}</span>
            <span>{formatCurrency(item.precio)}</span>
            <div className="stock-controls">
              <button
                className="stock-button"
                onClick={() => handleStockChange(category, item.id, -1)}
              >
                -
              </button>
              <span>{item.stock}</span>
              <button
                className="stock-button"
                onClick={() => handleStockChange(category, item.id, 1)}
              >
                +
              </button>
              <button
                className="sale-button"
                onClick={() => handleRegisterSale(category, item.id, 1)}
              >
                ✔️
              </button>
            </div>
            <button
              className="remove-button"
              onClick={() => handleDelete(category, item.id)}
            >
              x
            </button>
          </div>
        ))}
      </div>

      {/* Botón para añadir nuevo artículo */}
      <button className="add-item-btn" onClick={toggleForm}>
        Agregar Artículo
      </button>

      {showForm && (
           <form
           onSubmit={(e) => handleSubmit(e, category)}
           className="add-item-form"
         >
           <input
             type="text"
             placeholder="Nombre del ítem"
             value={newItem[category]?.nombre || ""}
             onChange={(e) =>
               setNewItem((prev) => ({
                 ...prev,
                 [category]: {
                   ...prev[category],
                   nombre: e.target.value,
                 },
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
                 [category]: {
                   ...prev[category],
                   precio: e.target.value,
                 },
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
                 [category]: {
                   ...prev[category],
                   stock: e.target.value,
                 },
               }))
             }
             required
           />
           <button type="submit" className="submit-button">
             Guardar
           </button>
         </form>
      )}
    </div>
  );
};

export default Stock;

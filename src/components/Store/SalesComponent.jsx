import React from "react";
import PropTypes from "prop-types";
import "./SalesComponent.css";

const SalesComponent = ({ sales, category }) => {
  return (
    <div className="sales-table-container">
      {sales.length > 0 ? (
        <table className="sales-table">
          <thead>
            <tr>
              <th>Artículo</th>
              <th>Cantidad</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.map(({ item, sales }) => (
              <tr key={item.id}>
                <td>{item.nombre || "Sin nombre"}</td>
                <td>x{sales || 0}u.</td>
                <td>${(sales || 0) * item.precio}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No hay ventas registradas hoy para la categoría {category}.</p>
      )}
    </div>
  );
};

SalesComponent.propTypes = {
  sales: PropTypes.arrayOf(
    PropTypes.shape({
      item: PropTypes.shape({
        id: PropTypes.string.isRequired,
        nombre: PropTypes.string,
        precio: PropTypes.number.isRequired,
      }).isRequired,
      sales: PropTypes.number.isRequired,
    })
  ).isRequired,
  category: PropTypes.string.isRequired,
};

export default SalesComponent;

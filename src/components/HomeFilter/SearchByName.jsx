import React from 'react';
import './SearchByName.css';

const SearchByName = ({ searchTerm, setSearchTerm }) => {
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value); // Actualizamos el estado en tiempo real
  };

  return (
    <div className="search-by-name">
     <p>Busca por nombre de complejo! </p>
      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={searchTerm}
        onChange={handleInputChange}
      />
    </div>
  );
};

export default SearchByName;

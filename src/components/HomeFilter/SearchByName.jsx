import React from 'react';
import './SearchByName.css';

const SearchByName = ({ setSearchTerm, searchTerm, businesses }) => {
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value); 
  };

  const handleSearchClick = () => {
    console.log('Búsqueda iniciada con el término:', searchTerm);
  
    // Verificar si businesses es un arreglo y tiene elementos
    if (Array.isArray(businesses)) {
      const matchingBusinesses = businesses.filter(business =>
        business.establishmentName.toLowerCase().includes(searchTerm.toLowerCase())
      );
  
      if (matchingBusinesses.length > 0) {
        console.log('Negocios que coinciden con la búsqueda:');
        matchingBusinesses.forEach(business => {
          console.log(business.establishmentName);
        });
      } else {
        console.log('No se encontraron negocios que coincidan con el término:', searchTerm);
      }
    } else {
      console.log('La lista de negocios no está disponible o no es un arreglo.');
    }
  };
  

  return (
    <div className="search-by-name-container">
      <input
        type="text"
        placeholder="Buscar espacio por nombre"
        value={searchTerm} 
        onChange={handleInputChange}
        className="search-by-name-input"
      />
      <button 
        onClick={handleSearchClick}
        className="search-button"
      >
        Buscar
      </button>
    </div>
  );
};

export default SearchByName;

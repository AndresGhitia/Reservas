import React from 'react';
import './BusinessAmenities.css';

const BusinessAmenities = ({ amenities }) => {
  if (!amenities || amenities.length === 0) {
    return (
      <div className='business-amenities' >
        <h1>Prestaciones del establecimiento</h1>
        <p>No se han registrado prestaciones.</p>
      </div>
    );
  }

  return (
    <div className='business-amenities'>
      <h1>Instalaciones</h1>
      <ul >
        {amenities.map((amenity, index) => (
          <li key={index}>
            {amenity}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BusinessAmenities;
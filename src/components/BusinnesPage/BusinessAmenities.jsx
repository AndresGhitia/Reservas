import React from 'react';
import { FaCheck } from 'react-icons/fa';
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
      <div className='business-amenities-info'>
        <ul >
          {amenities.map((amenity, index) => (
            <li key={index}>
              <FaCheck className="check-icon" />{amenity}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BusinessAmenities;
import React from 'react';
import './BusinessAmenities.css';

const BusinessAmenities = ({ amenities }) => {
  if (!amenities || amenities.length === 0) {
    return (
      <div className="business-amenities">
        <h3>Prestaciones del establecimiento</h3>
        <p>No se han registrado prestaciones.</p>
      </div>
    );
  }

  return (
    <div className="business-amenities">
      <h3>Prestaciones del establecimiento</h3>
      <ul className="amenities-list">
        {amenities.map((amenity, index) => (
          <li key={index} className="amenity-item">
            {amenity}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BusinessAmenities;
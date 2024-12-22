import React from 'react';
import { FaWifi, FaShower, FaRestroom, FaUtensils, FaDumbbell, FaGamepad, FaCalendarAlt, FaChalkboardTeacher, FaParking } from "react-icons/fa";
import { MdPool } from "react-icons/md"; 
import './BusinessAmenities.css';

const iconMap = {
  wifi: <FaWifi size={32} />,
  duchas: <FaShower size={32} />,
  vestuarios: <FaRestroom size={32} />,
  baños: <FaRestroom size={32} />,
  parrilla: <FaUtensils size={32} />,
  gimnasio: <FaDumbbell size={32} />,
  pileta: <MdPool size={32} />, 
  juegos: <FaGamepad size={32} />,
  eventos: <FaCalendarAlt size={32} />,
  clases: <FaChalkboardTeacher size={32} />,
  estacionamiento: <FaParking size={32} />
};



const BusinessAmenities = ({ amenities }) => {
  if (!amenities || amenities.length === 0) {
    return (
      <div className='business-amenities'>
        <h1>Prestaciones del establecimiento</h1>
        <p>No se han registrado prestaciones.</p>
      </div>
    );
  }

  return (
    <div className='business-amenities'>
      <h1>Instalaciones</h1>
      <div className='business-amenities-info'>
        <ul className="amenities-list">
        <div className='business-amenities-info'>  
          {amenities.map((amenity, index) => (
            <li key={index}>
            {iconMap[amenity.toLowerCase()] || <FaQuestionCircle size={32} />} {/* Ícono por defecto */}
            <span className="amenity-text">{amenity}</span>
          </li>
          ))}
         </div>
        </ul>
      </div>
    </div>
  );
};

export default BusinessAmenities;

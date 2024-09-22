// src/components/WhatsappButton/WhatsappButton.jsx
import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';
//import './WhatsappButton.css'; // Puedes crear un archivo CSS para estilos específicos

const WhatsappButton = ({ phoneNumber }) => {
  if (!phoneNumber) return null;

  return (
    <div className="whatsapp-info">
      <FaWhatsapp className="whatsapp-icon" />
      <a href={`https://wa.me/${phoneNumber}`} target="_blank" rel="noopener noreferrer">
        {phoneNumber}
      </a>
    </div>
  );
};

export default WhatsappButton;

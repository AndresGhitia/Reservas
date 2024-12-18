  import React from 'react';
  import { FaWhatsapp } from 'react-icons/fa';
  import './Whatsapp.css'; 

  const WhatsappButton = ({ phoneNumber }) => {
    if (!phoneNumber) return null;

    return (
    
    <div  className="whatsapp-container"> 
    <div className="whatsapp-info">
        <FaWhatsapp className="whatsapp-icon" />
        <a href={`https://wa.me/${phoneNumber}`} target="_blank" rel="noopener noreferrer">
          {phoneNumber}
        </a>
      </div>
    </div>
    );
  };

  export default WhatsappButton;

  import React from 'react';
  import './Whatsapp.css'; 

  const WhatsappButton = ({ phoneNumber }) => {
    if (!phoneNumber) return null;

    return (
    
    <div  className="whatsapp-container"> 
    <div className="whatsapp-info">
        <a href={`https://wa.me/${phoneNumber}`} target="_blank" rel="noopener noreferrer">
          {phoneNumber}
        </a>
      </div>
    </div>
    );
  };

  export default WhatsappButton;

import React from 'react';
import WhatsappButton from '../../components/Whatsapp/WhatsappButton'
import './BpHeader.css';

const BpHeader = ({ decodedName, formattedAddress, ownerData }) => {
  return (
    <div className='business-header'>   
      <div className='business-header-info'>
        <h1>Bienvenido a {decodedName}</h1>
        {/* <p>{formattedAddress || ownerData.address}</p> */}
        <div className='whatsapp-container'>
          {/* <p><WhatsappButton phoneNumber={ownerData.whatsapp}/></p> */}
          {/* <p>Contactanos!</p> */}
        </div>
      </div>
    </div>
  );
};

export default BpHeader;

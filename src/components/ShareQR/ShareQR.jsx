import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import './ShareQR.css'

const ShareQR = ({ url, onClose, businessName }) => {
  return (
    <div className="qr-modal">
      <div className="qr-content">
        <h1>ClubWeb</h1>
        <h2>Escanea el código y visita la pagina de  {businessName}</h2>
        <QRCodeCanvas value={url} size={200} />
        <button onClick={onClose} className="close-btn">Cerrar</button>
      </div>
    </div>
  );
};

export default ShareQR;

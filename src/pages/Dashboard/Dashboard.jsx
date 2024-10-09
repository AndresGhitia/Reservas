import React, { useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { fetchOwnerDataAndSpaces } from '../../utils/fetchOwnerData';
import './Dashboard.css';
import Add from '../Add/Add';
import List from '../List/List';
import CalendarComponent from '../../components/Calendar/Calendar';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import ShareQR from '../../components/ShareQR/ShareQR'; 
import { QRCodeCanvas } from 'qrcode.react';

function Dashboard() {
  const { establishmentName } = useParams();
  const decodedName = decodeURIComponent(establishmentName).replace(/-/g, ' ');
  const [ownerData, setOwnerData] = useState(null);
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false); // Estado para controlar el modal QR
  const [imageUrl, setImageUrl] = useState(""); // Estado para la URL de la imagen subida

  useEffect(() => {
    fetchOwnerDataAndSpaces(setOwnerData, setSpaces, setError, setLoading);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(`http://localhost:5173/${encodeURIComponent(decodedName.replace(/ /g, '-'))}`)
      .then(() => alert("Dirección de tu negocio copiada en el portapapeles"))
      .catch(err => console.error('Error al copiar el enlace: ', err));
  };

  const handleShowQRModal = () => {
    setShowQRModal(true);
  };

  const handleCloseQRModal = () => {
    setShowQRModal(false);
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!ownerData) {
    return <div>No se encontraron datos del propietario.</div>;
  }

  return (
    <div>
      <Navbar></Navbar>
      <div className="owner-container">
        <h1>Hola, {ownerData.ownerName}</h1>
        <p>Bienvenido al panel de administración de {decodedName}</p>
      </div>
      <hr />
      <Sidebar />
      <div className='outlet-container'>
        <Outlet />
      </div>


        <div className="share-Button-container">

         <div className="share-Buttons">   
          <button onClick={handleCopy}>
            Compartir URL
          </button>
      
          <button onClick={handleShowQRModal} style={{ marginTop: '20px' }}>
            Compartir con QR
          </button>
          </div>

          <button
            onClick={() => window.open(`http://localhost:5173/${establishmentName}`, '_blank')}
            style={{ marginTop: '20px' }}
          >
            Ir al sitio del negocio
          </button>
      
        </div>

        {/* Modal QR */}
        {showQRModal && (
          <ShareQR
            url={`http://localhost:5173/${encodeURIComponent(decodedName.replace(/ /g, '-'))}`}
            businessName={decodedName}  // Pasa el nombre del negocio aquí
            onClose={handleCloseQRModal}
          />
        )}

    </div>
  );
}

export default Dashboard;

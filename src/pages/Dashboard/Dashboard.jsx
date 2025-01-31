import React, { useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { db, auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { fetchOwnerDataAndSpaces } from '../../utils/fetchOwnerData';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import CalendarOwner from '../../components/Calendar/CalendarOwner';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import AmenitiesSelector from './AmenitiesSelector/AmenitiesSelector';
import ShareQR from '../../components/ShareQR/ShareQR';
import News from './News/News';
import { setupAuthListener } from './UtilsDashboard/authUtils';
import { handleUploadBackgroundImage, saveBackgroundImageUrl } from './UtilsDashboard/imageUtils';
import { handleCopy } from './UtilsDashboard/shareUtils';
import { handleCloseModal } from './UtilsDashboard/modalUtils';
import { handleUpdateAmenities } from './UtilsDashboard/amenitiesUtils';
import './Dashboard.css';

function Dashboard() {
  const { establishmentName } = useParams();
  const decodedName = decodeURIComponent(establishmentName).replace(/-/g, ' ');
  const [ownerData, setOwnerData] = useState(null);
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [calendarData, setCalendarData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);
  const bookItUrl = import.meta.env.VITE_BOOKIT_URL;
  const [amenities, setAmenities] = useState([]);
  const navigate = useNavigate();

  // Configuración del listener de autenticación
  useEffect(() => {
    const unsubscribe = setupAuthListener(async (user) => {
      if (user) {
        try {
          await fetchOwnerDataAndSpaces(setOwnerData, setSpaces, setError, setLoading);
        } catch (fetchError) {
          setLoading(false);
          console.error("Error al cargar los datos:", fetchError);
          setError("Error al cargar los datos del propietario.");
        }
      } else {
        navigate("/"); // Redirigir al home
        console.log("Usuario no autenticado.");
        setError("Usuario no autenticado.");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Manejo de la carga de la imagen de fondo
  const handleImageUpload = async (e) => {
    await handleUploadBackgroundImage(e, setImageUrl);
  };

  // Manejo del cierre del modal
  const closeModal = () => {
    handleCloseModal(setShowModal, setSelectedSpace, setCalendarData, setSelectedDate, setTimeSlots);
  };

  // Manejo de la copia de la URL
  const copyUrl = () => {
    handleCopy(bookItUrl, decodedName);
  };

  // Manejo de la actualización de amenities
  const updateAmenities = (updatedAmenities) => {
    handleUpdateAmenities(updatedAmenities, setAmenities);
  };

  if (loading) {
    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) return <div>{error}</div>;
  if (!ownerData) return <div>No se encontraron datos del propietario.</div>;

  return (
    <div className="dashboard-container">
      <Navbar />
      <div className="owner-container">
        <h1>Hola, {ownerData.ownerName}</h1>
        <p>Bienvenido al panel de administración de {decodedName}</p>
      </div>
      <hr />
      <Sidebar spaces={spaces} />
      <div className='outlet-container'>
        <Outlet />
      </div>
      {showModal && (
        <div className="modal">
          <CalendarOwner
            selectedSpace={selectedSpace}
            calendarData={calendarData}
            setCalendarData={setCalendarData}
            setTimeSlots={setTimeSlots}
            setSelectedDate={setSelectedDate}
            onClose={closeModal}
            sport={selectedSpace?.sport}
          />
          {selectedDate && (
            <div className="time-slots">
              {timeSlots.map((slot, index) => (
                <div key={index} className="slot-item">
                  {slot.time} - {slot.available ? (
                    <button
                      onClick={() => handleReserveSlot(index, selectedSpace, selectedDate, timeSlots, setTimeSlots)}
                      className="reserve-button"
                    >
                      Reservar
                    </button>
                  ) : (
                    <button
                      onClick={() => handleCancelReservation(index, selectedSpace, selectedDate, timeSlots, setTimeSlots)}
                      className="cancel-button"
                    >
                      Cancelar Reserva
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div className='businesspage-container'>
        <div className="business-leftcolumn">
          <div className='business-container'>
            <AmenitiesSelector
              db={db}
              userDocId={auth.currentUser?.uid}
              onUpdateAmenities={updateAmenities}
            />
            <News db={db} userDocId={auth.currentUser?.uid} />
          </div>
        </div>

        <div className="business-rightcolumn">
          <div className="upload-background">
            <div className="upload-background-header">
              <h1>Imagen del Complejo</h1>
            </div>
            <div className="upload-background-elements">
              <label htmlFor="file-upload" className="upload-background-file">
                Seleccionar archivo
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: "none" }}
              />
              {imageUrl && <img src={imageUrl} alt="Imagen de fondo" />}
            </div>
          </div>
          <div className="share-button-container">
            <div className='share-button-header'>
              <h1>Compartir Info</h1>
            </div>
            <div className="share-buttons">
              <button className='share-button-url' onClick={copyUrl}>Compartir URL</button>
              <button className='share-button-qr' onClick={() => setShowQRModal(true)}>Compartir QR</button>
              <button className="share-button-web" onClick={() => window.open(`${bookItUrl}/${establishmentName}`, '_blank')}> Ir al sitio del negocio </button>
            </div>
          </div>
          {showQRModal && (
            <ShareQR
              url={`${bookItUrl}/${encodeURIComponent(decodedName.replace(/ /g, '-'))}`}
              businessName={decodedName}
              onClose={() => setShowQRModal(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
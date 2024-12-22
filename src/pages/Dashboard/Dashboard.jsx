import React, { useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { fetchOwnerDataAndSpaces } from '../../utils/fetchOwnerData';
import { uploadImageToCloudinary } from '../../utils/cloudinaryUpload';
import './Dashboard.css';
import CalendarOwner from '../../components/Calendar/CalendarOwner';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';
import AmenitiesSelector from './AmenitiesSelector/AmenitiesSelector';
import ShareQR from '../../components/ShareQR/ShareQR';
import News from './News/News';

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          await fetchOwnerDataAndSpaces(setOwnerData, setSpaces, setError, setLoading);
        } catch (fetchError) {
          console.error("Error al cargar los datos:", fetchError);
          setError("Error al cargar los datos del propietario.");
        }
      } else {
        console.log("Usuario no autenticado.");
        setError("Usuario no autenticado.");
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCopy = () => {
    const textToCopy = `${bookItUrl}/${encodeURIComponent(decodedName.replace(/ /g, '-'))}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => alert("Dirección de tu negocio copiada en el portapapeles"))
        .catch(err => console.error('Error al copiar el enlace: ', err));
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert("Dirección de tu negocio copiada en el portapapeles");
      } catch (err) {
        console.error('Error al copiar el enlace: ', err);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSpace(null);
    setCalendarData([]);
    setSelectedDate(null);
    setTimeSlots([]);
  };

  const handleUploadBackgroundImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const url = await uploadImageToCloudinary(file);
      setImageUrl(url);
      saveBackgroundImageUrl(url);
    } catch (error) {
      console.error("Error al subir la imagen a Cloudinary: ", error);
    }
  };

  const saveBackgroundImageUrl = async (url) => {
    try {
      const user = auth.currentUser;
      const docRef = doc(db, 'owners', user.uid);
      await setDoc(docRef, { backgroundImageUrl: url }, { merge: true });
    } catch (error) {
      console.error("Error al guardar la URL de la imagen: ", error);
    }
  };

  const handleShowQRModal = () => setShowQRModal(true);
  const handleCloseQRModal = () => setShowQRModal(false);

  const handleUpdateAmenities = (updatedAmenities) => {
    setAmenities(updatedAmenities);
    console.log('Prestaciones actualizadas:', updatedAmenities);
  };

  if (loading) return <div>Cargando...</div>;
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
      <Sidebar />
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
            onClose={handleCloseModal}
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
              onUpdateAmenities={handleUpdateAmenities}
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
                onChange={handleUploadBackgroundImage}
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
              <button className='share-button-url' onClick={handleCopy}>Compartir URL</button>
              <button className='share-button-qr' onClick={handleShowQRModal}>Compartir QR</button>
              <button className="share-button-web" onClick={() => window.open(`${bookItUrl}/${establishmentName}`, '_blank')}> Ir al sitio del negocio </button>
            </div>
          </div>
          {showQRModal && (
            <ShareQR
              url={`${bookItUrl}/${encodeURIComponent(decodedName.replace(/ /g, '-'))}`}
              businessName={decodedName}
              onClose={handleCloseQRModal}
            />
          )}
        </div>
      </div>
    </div>

  );
}

export default Dashboard;

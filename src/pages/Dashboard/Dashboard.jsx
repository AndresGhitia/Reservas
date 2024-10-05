import React, { useEffect, useState } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { handleReserveSlot, handleCancelReservation } from '../../utils/reservationHandlers';
import { fetchOwnerDataAndSpaces } from '../../utils/fetchOwnerData';
import { uploadImageToCloudinary } from '../../utils/cloudinaryUpload';
import './Dashboard.css';
import Add from '../Add/Add';
import List from '../List/List';
import CalendarComponent from '../../components/Calendar/Calendar';
import Navbar from '../../components/Navbar/Navbar';
import Sidebar from '../../components/Sidebar/Sidebar';


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
  const [imageUrl, setImageUrl] = useState(""); // Estado para la URL de la imagen subida

  useEffect(() => {
    fetchOwnerDataAndSpaces(setOwnerData, setSpaces, setError, setLoading);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(`http://localhost:5173/${encodeURIComponent(decodedName.replace(/ /g, '-'))}`)
      .then(() => alert("Dirección de tu negocio copiada en el portapapeles"))
      .catch(err => console.error('Error al copiar el enlace: ', err));
  };

  const handleViewAvailability = async (space) => {
    setSelectedSpace(space);
    setLoading(true);
  
    try {
      const user = auth.currentUser;
      if (user) {
        const calendarList = await fetchCalendarData(user.uid, space.id);
        setCalendarData(calendarList);  // Asegurarse de que se está cargando la data correcta aquí
        if (selectedDate) {
          const availableSlots = calendarList[selectedDate]; // Filtro por la fecha seleccionada
          setTimeSlots(availableSlots || []);
        }
      }
    } catch (error) {
      console.error("Error al obtener el calendario: ", error);
    } finally {
      setLoading(false);
      setShowModal(true);
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
      setImageUrl(url); // Guardamos la URL de la imagen subida
      saveBackgroundImageUrl(url); // Guardamos la URL en Firestore

      console.log("URL de la imagen subida:", url); // Imprimir en la consola
    } catch (error) {
      console.error("Error al subir la imagen a Cloudinary: ", error);
    }
  };

  const saveBackgroundImageUrl = async (url) => {
    try {
      const user = auth.currentUser;
      const docRef = doc(db, 'owners', user.uid);
      await setDoc(docRef, { backgroundImageUrl: url }, { merge: true }); // Guardar o actualizar la URL de la imagen
    } catch (error) {
      console.error("Error al guardar la URL de la imagen: ", error);
    }
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

      {/* Mostrar espacios del usuario */}
      {/* <List spaces={spaces} handleViewAvailability={handleViewAvailability} /> */}

      <div className='control-panel'>
        {/* <Add setSpaces={setSpaces} setError={setError} setLoading={setLoading} /> */}

        {showModal && (
          <div className="modal">
            <CalendarComponent
              selectedSpace={selectedSpace}
              calendarData={calendarData}
              setCalendarData={setCalendarData}
              setTimeSlots={setTimeSlots}
              setSelectedDate={setSelectedDate}
              onClose={handleCloseModal}
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

        <div className="action-container">

          {/* Input para subir la imagen de fondo */}
          <div className="upload-background">
            <h2>Cambiar imagen de fondo para la página del cliente</h2>
            <input type="file" accept="image/*" onChange={handleUploadBackgroundImage} />
            {imageUrl && <img src={imageUrl} alt="Imagen de fondo" style={{ width: '80px', marginTop: '10px' }} />}
          </div>
          <div className="spaces-Button-container">
            <button onClick={handleCopy}>
              Compartir URL
            </button>
            <button
              onClick={() => window.open(`http://localhost:5174/${establishmentName}`, '_blank')}
              style={{ marginTop: '20px' }}
            >
              Ver sitio del negocio
            </button>
          </div>
        </div>
      </div>


    </div>
  );
}

export default Dashboard;
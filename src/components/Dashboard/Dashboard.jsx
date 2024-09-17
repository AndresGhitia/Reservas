// src/pages/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, collection, getDocs, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import CalendarComponent from '../Calendar/Calendar';
import { handleReserveSlot, handleCancelReservation } from '../../utils/reservationHandlers';
import { deleteSpace } from '../../utils/spaceHandlers';
import { fetchOwnerDataAndSpaces } from '../../utils/fetchOwnerData';
import { handleAddSpace } from '../../utils/handleAddSpace';
import { uploadImageToCloudinary } from '../../utils/cloudinaryUpload'; // Usamos la función para subir a Cloudinary
import './Dashboard.css';

function Dashboard() {
  const { establishmentName } = useParams();
  const decodedName = decodeURIComponent(establishmentName).replace(/-/g, ' ');
  const [ownerData, setOwnerData] = useState(null);
  const [spaces, setSpaces] = useState([]);
  const [newSpaceName, setNewSpaceName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uniqueError, setUniqueError] = useState(null);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [calendarData, setCalendarData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [inputError, setInputError] = useState(false);
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
        const calendarRef = collection(db, 'owners', user.uid, 'spaces', space.id, 'calendar');
        const calendarSnap = await getDocs(calendarRef);
        const calendarList = calendarSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCalendarData(calendarList);
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

  const handleDeleteSpace = async (spaceId) => {
    const user = auth.currentUser;
    if (user) {
      const result = await deleteSpace(user.uid, spaceId);
      if (result) {
        setSpaces((prevSpaces) => prevSpaces.filter((space) => space.id !== spaceId));
      }
    }
  };

  const handleAddSpaceClick = async () => {
    if (newSpaceName.trim() === "") {
      setUniqueError("Debes ingresar un nombre para el espacio nuevo");
      return;
    }
    await handleAddSpace(newSpaceName, setNewSpaceName, setUniqueError);
    fetchOwnerDataAndSpaces(setOwnerData, setSpaces, setError, setLoading);
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
  

  // Guardar la URL de la imagen en Firestore
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
    <div className="container"
    >
      <h1>Hola, {ownerData.ownerName}</h1>
      <p>Bienvenido al panel de administración de {decodedName}.</p>

      <div className="spaces-container">
        <h2>Canchas de tu complejo</h2>
        <ul>
          {spaces.map(space => (
            <li key={space.id}>
              {space.name}
              <div>
                <button onClick={() => handleViewAvailability(space)}>Horarios</button>
                <button
                  onClick={() => handleDeleteSpace(space.id)}
                  style={{ marginLeft: '10px', backgroundColor: '#dc143c' }}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
        <input
          type="text"
          value={newSpaceName}
          onChange={(e) => setNewSpaceName(e.target.value)}
          placeholder="Nombre del nuevo espacio"
          className={inputError ? 'error' : ''} // Aplica la clase 'error' si hay un error
        />
        <button onClick={handleAddSpaceClick}>+ Agregar Espacio</button>
        {uniqueError && <p className="error-message">{uniqueError}</p>} {/* Mostrar mensaje de error */}
      </div>

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

      <div className="spaces-Button-container">
        <button onClick={handleCopy}>
          Compartir URL
        </button>
        <button
          onClick={() => window.open(`http://localhost:5173/${establishmentName}`, '_blank')}
          style={{ marginTop: '20px' }}
        >
          Ver sitio del negocio
        </button>
      </div>
      
      {/* Input para subir la imagen de fondo */}
      <div className="upload-background">
        <h2>Subir imagen de fondo para la página del cliente</h2>
        <input type="file" accept="image/*" onChange={handleUploadBackgroundImage} />
        {imageUrl && <img src={imageUrl} alt="Imagen de fondo" style={{ width: '8%', marginTop: '10px' }} />}
      </div>
    </div>
  );
}

export default Dashboard;

import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import CalendarComponent from '../../components/Calendar/Calendar';
import { handleReserveSlot, handleCancelReservation } from '../../utils/reservationHandlers';
import { deleteSpace } from '../../utils/spaceHandlers';
import { fetchOwnerDataAndSpaces } from '../../utils/fetchOwnerData';
import EditSpace from './EditSpace'; // Importar el nuevo componente
import './List.css';

function List() {
  const [ownerData, setOwnerData] = useState(null);
  const [spaces, setSpaces] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [calendarData, setCalendarData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [timeSlots, setTimeSlots] = useState([]);
  const [editingSpaceId, setEditingSpaceId] = useState(null); // Para saber qué espacio se está editando
  const [editedSpace, setEditedSpace] = useState(null); // Para guardar los cambios en el espacio

  useEffect(() => {
    const fetchData = async () => {
      await fetchOwnerDataAndSpaces(setOwnerData, setSpaces, setError, setLoading);
    };

    fetchData();
  }, []);

  const handleEditSpace = (space) => {
    setEditingSpaceId(space.id);
    setEditedSpace({ ...space }); // Inicializa el estado con los datos del espacio actual
  };

  const handleSaveSpace = async () => {
    try {
      const user = auth.currentUser;
      if (user && editedSpace) {
        const spaceDocRef = doc(db, 'owners', user.uid, 'spaces', editedSpace.id);
        await updateDoc(spaceDocRef, editedSpace); // Actualiza el espacio en Firebase
        setSpaces(spaces.map(space => (space.id === editedSpace.id ? editedSpace : space))); // Actualiza el estado
        setEditingSpaceId(null); // Sale del modo de edición
      }
    } catch (error) {
      console.error("Error al guardar los cambios: ", error);
    }
  };
  const cancelEdit = () => {
    setEditingSpaceId(null);
  };

const handleViewAvailability = async (space) => {
  setSelectedSpace(space);
  setLoading(true);

  try {
    const user = auth.currentUser;
    if (user) {
      const calendarList = await fetchCalendarData(user.uid, space.id);
      setCalendarData(calendarList); 
      if (selectedDate) {
        const availableSlots = calendarList[selectedDate]; 
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


  const handleDeleteSpace = async (spaceId) => {
    const user = auth.currentUser;
    if (user) {
      const result = await deleteSpace(user.uid, spaceId);
      if (result) {
        setSpaces((prevSpaces) => prevSpaces.filter((space) => space.id !== spaceId));
      }
    }
  };

  if (loading) {
    return <div>Cargando espacios...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="spaces-container">
      <h2>Canchas de tu complejo</h2>
      <ul>
  {spaces.map(space => (
    <li key={space.id}>
      {editingSpaceId === space.id ? (
        <EditSpace
          editedSpace={editedSpace}
          setEditedSpace={setEditedSpace}
          handleSaveSpace={handleSaveSpace}
          setEditingSpaceId={setEditingSpaceId}
          cancelEdit={cancelEdit}
        />
      ) : (
        <div className="space-row">
        <span className="space-name">{space.name}</span>
        <div className="space-info">
          Deporte: {space.sport} <br />
          Superficie: {space.surface} <br />
          Jugadores: {space.players} <br />
          Tarifa: ${space.rate}
        </div>
        <div className="space-buttons">
          <button onClick={() => handleViewAvailability(space)}>Horarios</button>
          <button onClick={() => handleEditSpace(space)}>Editar</button>
          <button
            onClick={() => handleDeleteSpace(space.id)}
            style={{ backgroundColor: '#dc143c' }}
          >
            Eliminar
          </button>
        </div>
      </div>
      
      )}
    </li>
  ))}
</ul>


      {showModal && (
        <div className="modal">
          <CalendarComponent
            selectedSpace={selectedSpace}
            calendarData={calendarData}
            setCalendarData={setCalendarData}
            setTimeSlots={setTimeSlots}
            setSelectedDate={setSelectedDate}
            onClose={() => setShowModal(false)}
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
    </div>
  );
}

export default List;

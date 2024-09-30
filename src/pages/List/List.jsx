import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import CalendarComponent from '../../components/Calendar/Calendar';
import { handleReserveSlot, handleCancelReservation } from '../../utils/reservationHandlers';
import { deleteSpace } from '../../utils/spaceHandlers';
import { fetchOwnerDataAndSpaces } from '../../utils/fetchOwnerData'; // Asegúrate de importar esta función

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

  useEffect(() => {
    const fetchData = async () => {
      await fetchOwnerDataAndSpaces(setOwnerData, setSpaces, setError, setLoading);
    };

    fetchData();
  }, []);

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
            <strong>{space.name}</strong> <br />
            Superficie: {space.surface} <br />
            Jugadores: {space.players} <br />
            Tarifa: ${space.rate} <br />
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
    </div>
  );
}

export default List;

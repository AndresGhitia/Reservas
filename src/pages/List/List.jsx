import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import CalendarComponent from '../../components/Calendar/Calendar';
import { handleReserveSlot, handleCancelReservation } from '../../utils/reservationHandlers';
import { deleteSpace } from '../../utils/spaceHandlers';
import { fetchOwnerDataAndSpaces } from '../../utils/fetchOwnerData';
import EditSpace from './EditSpace'; // Importar el nuevo componente
import './List.css';
import { assets } from '../../assets/assets';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  const [editingSpaceId, setEditingSpaceId] = useState(null);
  const [editedSpace, setEditedSpace] = useState(null);

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
        await updateDoc(spaceDocRef, editedSpace);
        setSpaces(spaces.map(space => (space.id === editedSpace.id ? editedSpace : space)));
        setEditingSpaceId(null);
        toast.success("Espacio guardado exitosamente");
      }
    } catch (error) {
      console.error("Error al guardar los cambios: ", error);
      toast.error("Error al guardar los cambios"); 
    }
  };

  const handleDeleteSpace = async (spaceId) => {
    const user = auth.currentUser;
    if (user) {
      const result = await deleteSpace(user.uid, spaceId);
      if (result) {
        setSpaces((prevSpaces) => prevSpaces.filter((space) => space.id !== spaceId));
        toast.success("Espacio eliminado exitosamente"); 
      } else {
        toast.error("Error al eliminar el espacio"); 
      }
    }
  };

  const cancelEdit = () => {
    setEditingSpaceId(null);
  };

  const handleViewAvailability = async (space) => {
    console.log("handleViewAvailability called with space:", space);
    setSelectedSpace(space);
    setLoading(true);
  
    try {
      const user = auth.currentUser;
      if (user) {
        console.log("User is authenticated:", user.uid);
  
        // Intentando obtener los datos del calendario
     //   const calendarList = await fetchCalendarData(user.uid, space.id);
        console.log("Calendar data fetched:", calendarList);
  
        setCalendarData(calendarList);
  
        if (selectedDate) {
          console.log("Selected date is:", selectedDate);
  
          const availableSlots = calendarList[selectedDate];
          console.log("Available slots for selected date:", availableSlots);
  
          setTimeSlots(availableSlots || []);
        } else {
          console.log("No selected date");
        }
      } else {
        console.log("User is not authenticated");
      }
    } catch (error) {
      console.error("Error al obtener el calendario:", error);
    } finally {
      setLoading(false);
      setShowModal(true);
      console.log("Loading finished, modal shown");
    }
  };
  

  if (loading) {
    return <div>Cargando espacios...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="list add flex-col">
      <p>Canchas de tu complejo</p>
      <div className='list-table'>
        <div className='list-table-format title'>
          <b>Nombre</b>
          <b>Deporte</b>
          <b>Superficie</b>
          <b>Jugadores</b>
          <b>Tarifa</b>
          <b>Editar</b>
          <b>Borrar</b>
          <b>Horarios</b>
        </div>
        {spaces.map(space => (
          <div key={space.id} className='list-table-format'>
            {editingSpaceId === space.id && editedSpace ? (
              <EditSpace
                editedSpace={editedSpace}
                setEditedSpace={setEditedSpace}
                handleSaveSpace={handleSaveSpace}
                setEditingSpaceId={setEditingSpaceId}
                cancelEdit={cancelEdit}
              />
            ) : (
              <>
                <p>{space.name}</p>
                <p>{space.sport}</p>
                <p>{space.surface}</p>
                <p>{space.players}</p>
                <p>${space.rate}</p>
                <p onClick={() => handleEditSpace(space)} style={{ cursor: 'pointer' }}><img src={assets.edit_icon}/></p>                
                <p onClick={() => handleDeleteSpace(space.id)} style={{ cursor: 'pointer' }}><img src={assets.delete_icon}/></p>                
                <p onClick={() =>handleViewAvailability(space)} style={{ cursor: 'pointer' }}><img src={assets.clock_icon}/></p> 
              </>
            )}
          </div>
        ))}
      </div>

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

      <ToastContainer />
    </div>
  );
}

export default List;

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, getDocs, deleteDoc, query, where, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, 'owners', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setOwnerData(docSnap.data());

            const spacesRef = collection(docRef, 'spaces');
            const spacesSnap = await getDocs(spacesRef);
            const spacesList = spacesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSpaces(spacesList);
          } else {
            setError("No se encontraron datos del propietario.");
          }
        } else {
          setError("Usuario no autenticado.");
        }
      } catch (error) {
        console.error("Error al obtener los datos del propietario: ", error);
        setError("Hubo un error al cargar los datos.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddSpace = async () => {
    if (newSpaceName.trim() === "") return;
    setUniqueError(null);

    try {
      const user = auth.currentUser;
      if (user) {
        const spacesRef = collection(db, 'owners', user.uid, 'spaces');
        const q = query(spacesRef, where("name", "==", newSpaceName));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setUniqueError("Ya existe un espacio con este nombre.");
        } else {
          const docRef = await addDoc(spacesRef, { name: newSpaceName });
          setSpaces(prevSpaces => [...prevSpaces, { id: docRef.id, name: newSpaceName }]);
          setNewSpaceName("");
        }
      }
    } catch (error) {
      console.error("Error al agregar un nuevo espacio: ", error);
    }
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

  const handleDateChange = async (date) => {
    setSelectedDate(date);
    const formattedDate = date.toISOString().split('T')[0];

    const selectedDayData = calendarData.find(day => day.date === formattedDate);
    if (selectedDayData) {
      setTimeSlots(selectedDayData.timeslots);
    } else {
      try {
        const user = auth.currentUser;
        if (user && selectedSpace) {
          const calendarRef = doc(db, 'owners', user.uid, 'spaces', selectedSpace.id, 'calendar', formattedDate);
          const calendarSnap = await getDoc(calendarRef);

          if (calendarSnap.exists()) {
            setTimeSlots(calendarSnap.data().timeslots);
          } else {
            // Generar y guardar horarios para esta fecha solo si se solicita
            const timeslots = [
              { time: '09:00', available: true },
              { time: '10:00', available: true },
              { time: '11:00', available: true },
            ];
            await setDoc(calendarRef, {
              date: formattedDate,
              timeslots: timeslots,
            });
            setTimeSlots(timeslots);
          }
        }
      } catch (error) {
        console.error("Error al cambiar la fecha: ", error);
      }
    }
  };

  const handleReserveSlot = async (slotIndex) => {
    try {
      const user = auth.currentUser;
      if (user && selectedSpace && selectedDate) {
        const formattedDate = selectedDate.toISOString().split('T')[0];
        const calendarRef = doc(db, 'owners', user.uid, 'spaces', selectedSpace.id, 'calendar', formattedDate);
        const updatedSlots = [...timeSlots];
        updatedSlots[slotIndex].available = false;
  
        await setDoc(calendarRef, {
          date: formattedDate,
          timeslots: updatedSlots,
        });
  
        setTimeSlots(updatedSlots);
      }
    } catch (error) {
      console.error("Error al reservar el horario: ", error);
    }
  };

  const handleCancelReservation = async (slotIndex) => {
    try {
      const user = auth.currentUser;
      if (user && selectedSpace && selectedDate) {
        const formattedDate = selectedDate.toISOString().split('T')[0];
        const calendarRef = doc(db, 'owners', user.uid, 'spaces', selectedSpace.id, 'calendar', formattedDate);
        const updatedSlots = [...timeSlots];
        updatedSlots[slotIndex].available = true;

        await setDoc(calendarRef, {
          date: formattedDate,
          timeslots: updatedSlots,
        });

        setTimeSlots(updatedSlots);
      }
    } catch (error) {
      console.error("Error al cancelar la reserva: ", error);
    }
  };

  const handleDeleteSpace = async (spaceId) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const spaceDocRef = doc(db, 'owners', user.uid, 'spaces', spaceId);
        const calendarCollectionRef = collection(spaceDocRef, 'calendar');
        const calendarSnapshot = await getDocs(calendarCollectionRef);

        const deletePromises = calendarSnapshot.docs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        await deleteDoc(spaceDocRef);
        setSpaces((prevSpaces) => prevSpaces.filter((space) => space.id !== spaceId));
      }
    } catch (error) {
      console.error("Error al borrar el espacio y su calendario: ", error);
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
      <h1>Hola, {ownerData.ownerName}</h1>
      <p>Bienvenido al panel de administración de {decodedName}.</p>
      <Link to="/" className="home-button">Home</Link>

      <div className="spaces-section">
        <h2>Espacios / Canchas</h2>
        <ul>
          {spaces.map((space) => (
            <li key={space.id}>
              {space.name}
              <button onClick={() => handleDeleteSpace(space.id)}>Borrar</button>
              <button onClick={() => handleViewAvailability(space)}>Ver disponibilidad</button>
            </li>
          ))}
        </ul>
        <input
          type="text"
          placeholder="Nombre del nuevo espacio"
          value={newSpaceName}
          onChange={(e) => setNewSpaceName(e.target.value)}
        />
        <button onClick={handleAddSpace}>Agregar Espacio</button>
        {uniqueError && <p className="error">{uniqueError}</p>}
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Disponibilidad de {selectedSpace.name}</h2>
            <button onClick={handleCloseModal}>Cerrar</button>

            <div className="calendar-container">
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
              />
            </div>

            <div className="timeslot-container">
              {timeSlots.length > 0 ? (
                timeSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => slot.available ? handleReserveSlot(index) : handleCancelReservation(index)}
                    className={`timeslot-button ${slot.available ? 'available' : 'reserved'}`}
                  >
                    {slot.time} - {slot.available ? "Reservar" : "Anular reserva"}
                  </button>
                ))
              ) : (
                <p>Seleccione una fecha para ver los horarios disponibles.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

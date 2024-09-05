// src/pages/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, getDocs, deleteDoc, query, where, setDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import CalendarComponent from './Calendar';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
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

  const handleReserveSlot = async (slotIndex) => {
    try {
      const user = auth.currentUser;
      if (user && selectedSpace && selectedDate) {
        const formattedDate = selectedDate.toISOString().split('T')[0]; // Asegúrate de que la fecha esté en el formato correcto
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

      <div>
        <h2>Espacios</h2>
        <ul>
          {spaces.map(space => (
            <li key={space.id}>
              {space.name}
              <button onClick={() => handleViewAvailability(space)}>Ver disponibilidad</button>
              <button onClick={() => handleDeleteSpace(space.id)}>Eliminar</button>
            </li>
          ))}
        </ul>
        <div>
          <input
            type="text"
            value={newSpaceName}
            onChange={(e) => setNewSpaceName(e.target.value)}
            placeholder="Nombre del nuevo espacio"
          />
          <button onClick={handleAddSpace}>Agregar Espacio</button>
          {uniqueError && <p>{uniqueError}</p>}
        </div>
      </div>

      {showModal && (
        <div className="modal">
          <button onClick={handleCloseModal}>Cerrar</button>
          <h2>Disponibilidad de {selectedSpace?.name}</h2>
          <CalendarComponent
            selectedSpace={selectedSpace}
            calendarData={calendarData}
            setCalendarData={setCalendarData}
            setTimeSlots={setTimeSlots}
            setSelectedDate={setSelectedDate}
            onClose={handleCloseModal} // Pasamos la función de cerrar

          />
          {selectedDate && (
            <div className="time-slots">
              {timeSlots.map((slot, index) => (
                <div key={index}>
                  {slot.time} - {slot.available ? (
                    <button onClick={() => handleReserveSlot(index)}>Reservar</button>
                  ) : (
                    <button onClick={() => handleCancelReservation(index)}>Cancelar Reserva</button>
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

export default Dashboard;

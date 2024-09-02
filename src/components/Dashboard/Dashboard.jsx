import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, getDocs, deleteDoc, query, where } from 'firebase/firestore';
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

  // Obtener datos del propietario y los espacios
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, 'owners', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setOwnerData(docSnap.data());

            // Obtener los espacios
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

  // Agregar nuevo espacio y calendario
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

          // Crear calendario para el nuevo espacio
          const calendarRef = collection(docRef, 'calendar');
          const currentDate = new Date();
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth() + 1;

          const daysInMonth = new Date(year, month, 0).getDate();

          // Guardar cada día del mes con horarios disponibles
          const batchPromises = [];
          for (let day = 1; day <= daysInMonth; day++) {
            const formattedDay = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const timeslots = [
              { time: '09:00', available: true },
              { time: '10:00', available: true },
              { time: '11:00', available: true },
              { time: '12:00', available: true },
              { time: '13:00', available: true },
              { time: '14:00', available: true },
              { time: '15:00', available: true },
              { time: '16:00', available: true },
              { time: '17:00', available: true },
              { time: '18:00', available: true },
              { time: '19:00', available: true },
              { time: '20:00', available: true },
              { time: '21:00', available: true },
              { time: '22:00', available: true },
              { time: '23:00', available: true },





            ];
            batchPromises.push(
              addDoc(calendarRef, {
                date: formattedDay,
                timeslots: timeslots,
              })
            );
          }

          // Esperar a que todos los documentos se guarden
          await Promise.all(batchPromises);

          // Actualizar el estado con el nuevo espacio
          setSpaces(prevSpaces => [...prevSpaces, { id: docRef.id, name: newSpaceName }]);
          setNewSpaceName("");
        }
      }
    } catch (error) {
      console.error("Error al agregar un nuevo espacio: ", error);
    }
  };

  // Ver disponibilidad de un espacio
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

  // Cerrar el modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSpace(null);
    setCalendarData([]);
    setSelectedDate(null);
    setTimeSlots([]);
  };

  // Cambiar la fecha seleccionada en el calendario
  const handleDateChange = (date) => {
    setSelectedDate(date);
    const formattedDate = date.toISOString().split('T')[0];

    // Encontrar los horarios disponibles para la fecha seleccionada
    const selectedDayData = calendarData.find(day => day.date === formattedDate);
    setTimeSlots(selectedDayData ? selectedDayData.timeslots : []);
  };

  // Borrar espacio y su calendario
  const handleDeleteSpace = async (spaceId) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const spaceDocRef = doc(db, 'owners', user.uid, 'spaces', spaceId);

        // Obtener referencia a la colección de calendario
        const calendarCollectionRef = collection(spaceDocRef, 'calendar');
        const calendarSnapshot = await getDocs(calendarCollectionRef);

        // Eliminar documentos del calendario
        const deletePromises = calendarSnapshot.docs.map((doc) => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        // Eliminar el espacio después de eliminar el calendario
        await deleteDoc(spaceDocRef);

        // Actualizar el estado eliminando el espacio del array
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

            {selectedDate && (
              <div className="time-slots">
                <h3>Horarios para {selectedDate.toDateString()}</h3>
                {timeSlots.length > 0 ? (
                  <ul>
                    {timeSlots.map((slot, index) => (
                      <li key={index}>
                        {slot.time} - {slot.available ? 'Disponible' : 'No Disponible'}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No hay horarios disponibles para esta fecha.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

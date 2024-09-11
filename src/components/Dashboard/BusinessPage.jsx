import React, { useState, useEffect } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '../../firebase';
import { useParams } from 'react-router-dom';
import CalendarComponent from './Calendar';
const PublicBusinessPage = () => {
  const [businessData, setBusinessData] = useState(null);
  const [spaces, setSpaces] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [calendarData, setCalendarData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarVisible, setCalendarVisible] = useState(false);
  const { businessName } = useParams();

  useEffect(() => {
    const fetchAndLogData = async () => {
      try {
        console.log(`Decodificando nombre del establecimiento: ${businessName}`);

        const ownersRef = collection(db, 'owners');
        const ownersSnap = await getDocs(ownersRef);

        let found = false;
        for (const ownerDoc of ownersSnap.docs) {
          if (ownerDoc.data().businessName === businessName) {
            found = true;
            setBusinessData(ownerDoc.data());

            const spacesRef = collection(ownerDoc.ref, 'spaces');
            const spacesSnap = await getDocs(spacesRef);

            const spacesList = spacesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSpaces(spacesList);
            break;
          }
        }

        if (!found) {
          setError("No se encontraron datos del negocio.");
        }
      } catch (error) {
        console.error("Error al obtener los datos del negocio:", error);
        setError("Hubo un error al cargar los datos.");
      } finally {
        setLoading(false);
      }
    };

    fetchAndLogData();
  }, [businessName]);

  const handleViewAvailability = async (space) => {
    setSelectedSpace(space);
    setCalendarVisible(true);

    try {
      const calendarRef = collection(db, 'owners', 'owner-id-placeholder', 'spaces', space.id, 'calendar'); // Reemplaza 'owner-id-placeholder' con el id correcto del propietario si es necesario
      const calendarSnap = await getDocs(calendarRef);
      const calendarList = calendarSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCalendarData(calendarList);
    } catch (error) {
      console.error("Error al obtener los datos del calendario:", error);
      setError("Hubo un error al cargar el calendario.");
    }
  };

  const handleCloseCalendar = () => {
    setCalendarVisible(false);
    setSelectedDate(null);
  };

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h1>{businessData?.businessName}</h1>
      <p>{businessData?.address}</p>
      <h2>Canchas disponibles del complejo</h2>
      {spaces.length > 0 ? (
        <ul>
          {spaces.map(space => (
            <li key={space.id}>
              {space.name}
              <button onClick={() => handleViewAvailability(space)}>Ver disponibilidad</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay canchas disponibles.</p>
      )}

      {calendarVisible && (
        <CalendarComponent
          selectedSpace={selectedSpace}
          calendarData={calendarData}
          setCalendarData={setCalendarData}
          setSelectedDate={setSelectedDate} 
          onClose={handleCloseCalendar}

        />
      )}
    </div>
  );
};

export default PublicBusinessPage;

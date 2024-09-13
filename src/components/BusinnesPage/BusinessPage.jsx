import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import CalendarComponent from '../Calendar/Calendar';
import './BusinessPage.css'; // Importa los estilos

function BusinessPage() {
  const { establishmentName } = useParams();
  const decodedName = decodeURIComponent(establishmentName).replace(/-/g, ' '); // Convierte Hulk-Padel a Hulk Padel
  const [ownerData, setOwnerData] = useState(null);
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [calendarData, setCalendarData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const businessRef = collection(db, 'owners');

    const unsubscribeBusiness = onSnapshot(businessRef, (querySnapshot) => {
      let foundBusiness = null;

      console.log('Fetching data for:', decodedName);

      querySnapshot.forEach((doc) => {
        const businessData = doc.data();
        console.log('Checking business:', businessData);

        if (businessData && businessData.establishmentName) {
          const normalizedDecodedName = decodedName.trim().toLowerCase();
          const normalizedBusinessName = businessData.establishmentName.trim().toLowerCase();

          console.log('Comparing:', normalizedBusinessName, normalizedDecodedName);

          if (normalizedBusinessName === normalizedDecodedName) {
            foundBusiness = { id: doc.id, ...businessData };
            console.log('Business found:', foundBusiness);
          }
        }
      });

      if (foundBusiness) {
        setOwnerData(foundBusiness);

        const spacesRef = collection(db, 'owners', foundBusiness.id, 'spaces');
        const unsubscribeSpaces = onSnapshot(spacesRef, (spacesSnap) => {
          const spacesList = spacesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          console.log('Spaces updated:', spacesList);
          setSpaces(spacesList);
          setLoading(false);
        });

        return () => unsubscribeSpaces();
      } else {
        console.log('No business found with the name:', decodedName);
        setError(`No se encontró ningún negocio con el nombre: ${decodedName}`);
        setLoading(false);
      }
    });

    return () => unsubscribeBusiness();
  }, [decodedName]);

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedSpace(null);
    setCalendarData([]);
    setSelectedDate(null);
  };

  const handleViewAvailability = (space) => {
    setSelectedSpace(space);
    setLoading(true);

    const calendarRef = collection(db, 'owners', ownerData.id, 'spaces', space.id, 'calendar');
    const unsubscribeCalendar = onSnapshot(calendarRef, (calendarSnap) => {
      const calendarList = calendarSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      console.log('Calendar updated:', calendarList);
      setCalendarData(calendarList);
      setLoading(false);
    });

    return () => unsubscribeCalendar();
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  if (!ownerData) {
    return <div className="no-data">No se encontraron datos del negocio.</div>;
  }

  return (
    <div className="business-container">
      <h1>{decodedName}</h1>

      <div className="spaces-container">
        <h2>Canchas dispnibles</h2>
        <ul>
          {spaces.map(space => (
            <li key={space.id}>
              {space.name}
              <button onClick={() => handleViewAvailability(space)}>Ver disponibilidad</button>
            </li>
          ))}
        </ul>
      </div>

      {selectedSpace && (
        <div className="selected-space">
          <h2>Disponibilidad de {selectedSpace.name}</h2>
          <CalendarComponent
            selectedSpace={selectedSpace}
            calendarData={calendarData}
            setCalendarData={setCalendarData}
            onClose={handleCloseModal}
            setSelectedDate={setSelectedDate}
          />
        </div>
      )}
    </div>
  );
}

export default BusinessPage;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Importar useNavigate para navegar a Home
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import CalendarComponent from '../Calendar/Calendar';
import businessPage from '../../assets/businessPage.jpeg';
import WhatsappButton from '../Whatsapp/WhatsappButton'; 
import BusinessMap from './BusinessMap';
import SpaceLine from './SpaceLine';  
import './BusinessPage.css';

function BusinessPage() {
  const { establishmentName } = useParams();
  const navigate = useNavigate(); // Hook para navegación
  const decodedName = decodeURIComponent(establishmentName).replace(/-/g, ' ');
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

      querySnapshot.forEach((doc) => {
        const businessData = doc.data();
        if (businessData && businessData.establishmentName) {
          const normalizedDecodedName = decodedName.trim().toLowerCase();
          const normalizedBusinessName = businessData.establishmentName.trim().toLowerCase();
          
          if (normalizedBusinessName === normalizedDecodedName) {
            foundBusiness = { id: doc.id, ...businessData };
          }
        }
      });

      if (foundBusiness) {
        setOwnerData(foundBusiness);

        const spacesRef = collection(db, 'owners', foundBusiness.id, 'spaces');
        const unsubscribeSpaces = onSnapshot(spacesRef, (spacesSnap) => {
          const spacesList = spacesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
          setSpaces(spacesList);
          setLoading(false);
        });

        return () => unsubscribeSpaces();
      } else {
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

  const backgroundImageUrl = ownerData.backgroundImageUrl;

  return (
    <div className="business-container" style={{ backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : `url(${businessPage})` }}>
      {/* Barra de navegación */}
      <nav className="navbar-business">
        <button onClick={() => navigate('/')} className="home-button">Volver a Home</button>
        <h2>{decodedName}</h2>
      </nav>

      {/* Contenido principal */}
      <div className="spaces-container">
        <h2>Canchas disponibles</h2>
          <ul>
            {spaces.map(space => (
              <SpaceLine key={space.id} space={space} handleViewAvailability={handleViewAvailability} /> 
            ))}
          </ul>

        {ownerData.whatsapp && (
          <div className="whatsapp-container">
            <WhatsappButton phoneNumber={ownerData.whatsapp} />
          </div>
        )}
      </div>

      {ownerData.address && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          borderRadius: '12px',
          boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
          width: '60%',
          maxWidth: '900px',
          textAlign: 'center',
          transition: 'all 0.3s ease'
        }}>
          <h3>Ubicación: {ownerData.address} </h3>
          <BusinessMap address={ownerData.address} />
        </div>
      )}

      {selectedSpace && (
        <div className="selected-space">
          <CalendarComponent
            selectedSpace={selectedSpace}
            calendarData={calendarData}
            setCalendarData={setCalendarData}
            onClose={handleCloseModal}
            setSelectedDate={setSelectedDate}
            disableBooking={true}
          />
        </div>
      )}
    </div>
  );
}

export default BusinessPage;

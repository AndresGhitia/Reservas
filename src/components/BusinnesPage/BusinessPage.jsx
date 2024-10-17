import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import CalendarUser from '../Calendar/CalendarUser';
import WhatsappButton from '../Whatsapp/WhatsappButton';
import BusinessMap from './BusinessMap';
import SpaceLine from './SpaceLine';
import Navbar from '../Navbar/Navbar';
import './BusinessPage.css';
import { assets } from '../../assets/assets';

function BusinessPage() {
  const { establishmentName } = useParams();
  const decodedName = decodeURIComponent(establishmentName).replace(/-/g, ' ');
  const [ownerData, setOwnerData] = useState(null);
  const [spaces, setSpaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSpace, setSelectedSpace] = useState(null);
  const [calendarData, setCalendarData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [ownerId, setOwnerId] = useState(null);
  const [cel, setCel] = useState(null);
  const [formattedAddress, setFormattedAddress] = useState(''); 

  useEffect(() => {
    const businessRef = collection(db, 'owners');

    const unsubscribeBusiness = onSnapshot(businessRef, (querySnapshot) => {
      var foundBusiness = null;

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
        setOwnerId(foundBusiness.id); 
        setCel(foundBusiness.whatsapp); // Asignar el WhatsApp a cel

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
    <div>
      <Navbar />
      <div className='business-header'>
        <div className='business-header-info'>
          <h1>{decodedName}</h1>
          <p>{formattedAddress || ownerData.address}</p>      
          <p>{ownerData.whatsapp}</p>
        </div>
      </div>
      <div className='business-container'>
        <div className="businesspage-container">
          {spaces.map(space => (
            <SpaceLine key={space.id} space={space} handleViewAvailability={handleViewAvailability} />
          ))}
        </div>

        {ownerData.whatsapp && (
          <div className="businessmap-container">
            {ownerData.address && (
              <div className='address-container'>
                <img src={assets.address_icon} alt="Address Icon" />
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ownerData.address)}`}
                  target='_blank'
                  rel='noopener noreferrer'>
                  UBICACION
                </a>
              </div>
            )}
            <BusinessMap address={ownerData.address} onAddressFormatted={setFormattedAddress} /> {/* Pasar la función de devolución de llamada */}
            <div className='whatsapp-container'>
              <h1>CONTACTANOS</h1>
              <p><WhatsappButton phoneNumber={ownerData.whatsapp} /></p>
            </div>
          </div>
        )}

        {selectedSpace && (
          <div className="selected-space">
            <CalendarUser
              selectedSpace={selectedSpace}
              calendarData={calendarData}
              setCalendarData={setCalendarData}
              onClose={handleCloseModal}
              setSelectedDate={setSelectedDate}
              disableBooking={true}
              ownerId={ownerId}
              cel={cel}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default BusinessPage;

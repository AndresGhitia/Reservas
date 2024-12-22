import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import businessPage from '../../assets/businessPage.jpeg';
import CalendarUser from '../Calendar/CalendarUser';
import BusinessMap from './BusinessMap';
import SpaceLine from './SpaceLine';
import Navbar from '../Navbar/Navbar';
import './BusinessPage.css';
import BpHeader from './BpHeader';
import BusinessAmenities from './BusinessAmenities';
import WhatsappButton from '../Whatsapp/WhatsappButton';
import BPNews from './BpNews';

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
  const [formattedAddress, setFormattedAddress] = useState('');
  const [expandedCards, setExpandedCards] = useState({});
  const [showContactNumber, setShowContactNumber] = useState(false);

  const mapRef = useRef(null);

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
        setOwnerId(foundBusiness.id);

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

  const handleContactClick = () => {
    setShowContactNumber(true);
  };

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

  const toggleCardExpansion = (spaceId) => {
    setExpandedCards((prevExpandedCards) => ({
      ...prevExpandedCards,
      [spaceId]: !prevExpandedCards[spaceId],
    }));
  };

  const handleViewMap = () => {
    if (mapRef.current) {
      mapRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
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
    <>
      <Navbar />
      <div className="businesspage-container">
        <div className="business-leftcolumn">
          <div className="business-container">
            <BpHeader
              decodedName={decodedName}
              formattedAddress={formattedAddress}
              ownerData={ownerData}
            />
            <div
              className="space-image"
              style={{
                backgroundImage: backgroundImageUrl
                  ? `url(${backgroundImageUrl})`
                  : `url(${businessPage})`,
              }}
            ></div>

            <div className="space-header">
              <h1>Horarios y Disponibilidad</h1>
            </div>
            <div className="spaces-container">
              {spaces.map((space) => (
                <SpaceLine
                  key={space.id}
                  space={space}
                  handleViewAvailability={handleViewAvailability}
                  isExpanded={expandedCards[space.id]}
                  onToggleExpand={() => toggleCardExpansion(space.id)}
                />
              ))}
            </div>

            {selectedSpace && (
              <div className="selected-space">
                <CalendarUser
                  selectedSpace={selectedSpace}
                  calendarData={calendarData}
                  setCalendarData={setCalendarData}
                  onClose={handleCloseModal}
                  setSelectedDate={setSelectedDate}
                  disableBooking={false}
                  ownerId={ownerId}
                />
              </div>
            )}
            <div className="businessmap-container" ref={mapRef}>
              <div className="businessmap-header">
                <h1>Ubicación</h1>
              </div>
              <div className="businessmap-element">
                <BusinessMap address={ownerData.address} onAddressFormatted={setFormattedAddress} />
                <p>{formattedAddress}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="business-rightcolumn">
          <div className="amenities-container">
            <div className="amenities-header">
              <h1>Espacios</h1>
            </div>
            <div className="amenities-element">
              <p>
                {Array.isArray(ownerData.businessType)
                  ? ownerData.businessType.join(', ')
                  : ownerData.businessType || 'Sin rubro'}
              </p>
            </div>
            <BusinessAmenities amenities={ownerData.amenities} />
          </div>
          
          <BPNews db={db} news={ownerData?.news || []} userDocId={ownerId} />


          <div className="address-container">
            <div className="address-header">
              <h1>Dirección</h1>
            </div>
            <div className="address-element">
              <p>{formattedAddress}</p>
              <button className="login-button-address" onClick={handleViewMap}>
                VER MAPA
              </button>
              <button className="login-button-address" onClick={handleContactClick}>
                {showContactNumber ? (
                  <WhatsappButton phoneNumber={ownerData.whatsapp} />
                ) : (
                  'CONTACTANOS'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default BusinessPage;

import React, { useState, useEffect, useRef } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import './Location.css';
import { FaMapMarkerAlt } from 'react-icons/fa'; // Importamos el icono de FontAwesome

const Location = ({ userLocation, setUserLocation }) => {
  const [manualLocation, setManualLocation] = useState('');
  const [error, setError] = useState(null);
  const autocompleteRef = useRef(null);
  const Maps_ApiKey = import.meta.env.VITE_MAPS_APIKEY;

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${Maps_ApiKey}`
      );
      const data = await response.json();
      if (data.results.length > 0) {
        return data.results[0].formatted_address;
      } else {
        return 'Dirección no disponible';
      }
    } catch (error) {
      console.error('Error al obtener la dirección:', error);
      return 'Error al obtener la dirección';
    }
  };

  useEffect(() => {
    if (!userLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          const address = await reverseGeocode(latitude, longitude);
          setManualLocation(address);
        },
        (err) => setError(err.message)
      );
    } else if (userLocation) {
      const fetchAddress = async () => {
        const address = await reverseGeocode(userLocation.latitude, userLocation.longitude);
        setManualLocation(address);
      };
      fetchAddress();
    }
  }, [userLocation, setUserLocation]);

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current.getPlace();
    if (place && place.geometry) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setUserLocation({ latitude: lat, longitude: lng });
      setManualLocation(place.formatted_address);
      setError(null);
    } else {
      setError("No se pudo obtener la ubicación seleccionada");
    }
  };

  return (
    <div className='location-background'>
      <div className="location-container">
        <div className="location-header-title">
        {/* <FaMapMarkerAlt className="location-icon" /> */}
          <h3> ENCUENTRA UNA CANCHA </h3>
        </div>
        <div className='location-header-subtitle'>
          <p>Encuentra canchas cercanas dentro de Argentina</p>
        </div>
        {/* <p>{manualLocation ? manualLocation : 'Ubicación no disponible'}</p> */}
        <div className="location-input-container">
          <Autocomplete
            onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
            onPlaceChanged={handlePlaceChanged}
          >
            <input
              type="text"
              placeholder="Introduce tu ubicación"
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              onFocus={() => setManualLocation('')}
            />
          </Autocomplete>
        </div>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default Location;

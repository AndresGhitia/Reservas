import React, { useState, useEffect, useRef } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import './HomeFilter.css';
import Navbar from '../Navbar/Navbar';

const HomeFilter = ({ userLocation, setUserLocation, cardContainerRef, businessListRef }) => {
  const [manualLocation, setManualLocation] = useState('');
  const [error, setError] = useState(null);
  const [highlightInput, setHighlightInput] = useState(false);
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
    // Validar si autocompleteRef está inicializado
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place && place.geometry) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setUserLocation({ latitude: lat, longitude: lng });
        setManualLocation(place.formatted_address);
        setError(null);

        // Scroll to cards
        if (cardContainerRef?.current) {
          cardContainerRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        setError('No se pudo obtener la ubicación seleccionada');
      }
    } else {
      setError('Autocomplete no está inicializado correctamente.');
    }
  };

  const handleUseCurrentLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          const address = await reverseGeocode(latitude, longitude);
          setManualLocation(address);
          setError(null);

          // Highlight input
          setHighlightInput(true);
          setTimeout(() => setHighlightInput(false), 1000);
        },
        (err) => setError('No se pudo acceder a tu ubicación')
      );
    } else {
      setError('Tu navegador no soporta geolocalización');
    }
  };

  return (
    <div className="location-background">
      <div className='overlay-content'>
        <div className='overlay-text'>
          <h1>Reserva tu cancha ahora mismo</h1>
          <p>Encontra las canchas mas cercanas en tu ciudad, reserva y juga.</p>
        </div>
      </div>
      <div className="location-container">
        <div className="location-header-title">
          <h3>Busca cancha ahora</h3>
        </div>
        <div className="location-header-subtitle">
          <p>Ingresa la dirección o zona</p>
        </div>
        <div className="location-input-container">
          <Autocomplete
            onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
            onPlaceChanged={handlePlaceChanged}
          >
            <div className="input-with-icon">
              <button
                className="location-icon-button"
                onClick={handleUseCurrentLocation}
                aria-label="Usar mi ubicación actual"
              >
                📍
              </button>
              <input
                type="text"
                placeholder="Introduce tu ubicación"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                className={highlightInput ? 'highlight' : ''}
              />
            </div>
          </Autocomplete>
        </div>
        {error && <p className="error-message">{error}</p>}
        <div className="search-button-container">
          <button
            className="search-button"
            onClick={() => {
              if (businessListRef?.current) {
                businessListRef.current.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            <span className="icon">&#9917; </span> Ver canchas!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomeFilter;


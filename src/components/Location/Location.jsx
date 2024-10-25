// src/components/Location/Location.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import './Location.css';

const Location = ({ userLocation, setUserLocation }) => {
  const [manualLocation, setManualLocation] = useState('');
  const [error, setError] = useState(null);
  const autocompleteRef = useRef(null); // Referencia para el Autocomplete de Google
  const Maps_ApiKey = import.meta.env.VITE_MAPS_APIKEY;

  // Función para hacer geocoding inverso y obtener la dirección
  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${Maps_ApiKey}`
      );
      const data = await response.json();
      if (data.results.length > 0) {
        // Toma la primera dirección que regresa Google Maps
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
          
          // Obtener la dirección a partir de las coordenadas
          const address = await reverseGeocode(latitude, longitude);
          setManualLocation(address); // Inicializar el input con la dirección
        },
        (err) => setError(err.message)
      );
    } else if (userLocation) {
      // Si ya tenemos la ubicación del usuario, también obtenemos la dirección
      const fetchAddress = async () => {
        const address = await reverseGeocode(userLocation.latitude, userLocation.longitude);
        setManualLocation(address); // Mostrar la dirección si está disponible
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
      setManualLocation(place.formatted_address); // Actualizar el input con la dirección seleccionada
      setError(null);
    } else {
      setError("No se pudo obtener la ubicación seleccionada");
    }
  };

  return (
    <div className="location-container">
      <h3>Selecciona o ingresa tu ubicación</h3>
      <p>{manualLocation ? manualLocation : 'Ubicación no disponible'}</p> {/* Mostrar la dirección */}
      <Autocomplete
        onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
        onPlaceChanged={handlePlaceChanged}
      >
        <input
          type="text"
          placeholder="Introduce tu ubicación"
          value={manualLocation}
          onChange={(e) => setManualLocation(e.target.value)}
          onFocus={() => setManualLocation('')} // Limpiar el input al enfocarse
        />
      </Autocomplete>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default Location;

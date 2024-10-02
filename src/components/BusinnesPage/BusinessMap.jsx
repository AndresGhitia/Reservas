import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';

const BusinessMap = ({ address }) => {
  const [mapLocation, setMapLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); 
  useEffect(() => {
    const geocodeAddress = async (address) => {
      try {
        const apiKey = 'AIzaSyBWI5EoMzcJk-y6Mtdy0whcUwFQRvqc7po'; 
        console.log('Dirección que se va a geocodificar:', address);
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`);
        
        if (!response.ok) {
          throw new Error('Error en la geocodificación');
        }

        const data = await response.json();
        console.log('Respuesta de la API:', data); 
        
        if (data.results.length > 0) {
          return { lat: data.results[0].geometry.location.lat, lng: data.results[0].geometry.location.lng };
        } else {
          throw new Error('Dirección no encontrada');
        }
      } catch (error) {
        console.error('Error al geocodificar:', error);
        setError(error);
        return null;
      }
    };

    if (address) {
      geocodeAddress(address).then(location => {
        if (location) {
          setMapLocation(location);
        } else {
          console.error('No se pudo obtener la ubicación.');
        }
        setLoading(false); // Cambiar el estado de carga
      });
    }
  }, [address]);

  return (
    <div>
      {error && <div className="error">Error al cargar el mapa: {error.message}</div>}
      {loading ? (
        <div>Cargando mapa...</div>
      ) : mapLocation ? (
        <GoogleMap
          center={mapLocation}
          zoom={15 }
          mapContainerStyle={{ width: '100%', height: '200px' }}
        >
          <Marker position={mapLocation} />
        </GoogleMap>
      ) : (
        <div>No se pudo encontrar la ubicación.</div>
      )}
    </div>
  );
};

export default BusinessMap;

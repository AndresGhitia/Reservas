import React, { useEffect, useState } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';

const BusinessMap = ({ address, onAddressFormatted }) => {
  const [mapLocation, setMapLocation] = useState(null);
  const [formattedAddress, setFormattedAddress] = useState('');
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
          const location = {
            lat: data.results[0].geometry.location.lat,
            lng: data.results[0].geometry.location.lng
          };

          const fullAddress = data.results[0].formatted_address;
          const addressParts = fullAddress.split(', ');
          const street = addressParts[0];
          const streetNumber = addressParts[1] ? addressParts[1].match(/\d+/)[0] : '';
          const locality = addressParts[1] || '';
          
          const formattedAddress = `${street} ${streetNumber}, ${locality}`;

          setMapLocation(location);
          setFormattedAddress(formattedAddress);
          onAddressFormatted(formattedAddress); 
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
      geocodeAddress(address).then(() => {
        setLoading(false); // Cambiar el estado de carga
      });
    }
  }, [address, onAddressFormatted]);

  return (
    <div>
      {error && <div className="error">Error al cargar el mapa: {error.message}</div>}
      {loading ? (
        <div>Cargando mapa...</div>
      ) : mapLocation ? (
        <GoogleMap
          center={mapLocation}
          zoom={15}
          mapContainerStyle={{ width: '400px', height: '300px' }}
          options={{
            mapTypeControl: false, 
            streetViewControl: false,
            fullscreenControl: false, 
            zoomControl: false, 
          }}
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

import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore'; 
import { db } from '../../firebase'; 
import businessPage from '../../assets/businessPage.jpeg'; 
import './BusinessList.css'; 
import WhatsappButton from '../Whatsapp/WhatsappButton'; 
import '../Whatsapp/Whatsapp.css';

const BusinessList = ({ category }) => {
  const [businesses, setBusinesses] = useState([]);
  const [userLocation, setUserLocation] = useState(null); // Estado para la ubicación del usuario
  const [distances, setDistances] = useState({}); // Estado para almacenar distancias calculadas

  // Función para calcular la distancia usando la fórmula de Haversine
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Radio de la Tierra en km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Retorna la distancia en kilómetros
  };

  useEffect(() => {
    // Obtener la ubicación actual del usuario
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        setUserLocation({ lat: userLat, lng: userLng });
      },
      (error) => {
        console.error('Error al obtener la ubicación del usuario:', error);
      }
    );

    const fetchBusinesses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'owners'));
        if (querySnapshot.empty) {
          console.log('No matching documents.');
        } else {
          const businessData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setBusinesses(businessData);
        }
      } catch (error) {
        console.error("Error fetching businesses:", error);
      }
    };
  
    fetchBusinesses();
  }, []);

  const geocodeAddress = async (address) => {
    const apiKey = 'AIzaSyBWI5EoMzcJk-y6Mtdy0whcUwFQRvqc7po'; 
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`);
    
    if (!response.ok) {
      throw new Error('Error en la geocodificación');
    }

    const data = await response.json();
    if (data.results.length > 0) {
      return {
        lat: data.results[0].geometry.location.lat,
        lng: data.results[0].geometry.location.lng
      };
    } else {
      throw new Error('Dirección no encontrada');
    }
  };

  useEffect(() => {
    if (userLocation && businesses.length > 0) {
      businesses.forEach(async (business) => {
        if (business.address) {
          try {
            const businessLocation = await geocodeAddress(business.address);
            const distance = calculateDistance(
              userLocation.lat, 
              userLocation.lng, 
              businessLocation.lat, 
              businessLocation.lng
            );
            setDistances((prevDistances) => ({
              ...prevDistances,
              [business.id]: distance.toFixed(2), // Guardar la distancia en el estado
            }));
          } catch (error) {
            console.error(`Error al calcular la distancia para ${business.establishmentName}:`, error);
          }
        }
      });
    }
  }, [userLocation, businesses]);

  const sortedBusinesses = [...businesses].sort((a, b) => {
    const aMatches = a.businessType?.includes(category);
    const bMatches = b.businessType?.includes(category);

    if (aMatches && !bMatches) return -1;
    if (!aMatches && bMatches) return 1;
    return 0;
  });

  return (
    <div className="business-list">
      {sortedBusinesses.map((business) => (
        <div key={business.id} className="business-card">
          <img
            src={business.backgroundImageUrl || businessPage}
            alt={`${business.establishmentName} banner`}
            className="business-image"
          />
          <h3>{business.establishmentName}</h3>
          <p>{Array.isArray(business.businessType) ? business.businessType.join(', ') : business.businessType || 'Sin rubro'}</p>
          
          {business.address && (
            <p className="business-address">
              <i className="fas fa-map-marker-alt"></i> {business.address}
            </p>
          )}

          {userLocation && business.address && distances[business.id] && (
            <p>
              Distancia: {distances[business.id]} km
            </p>
          )}
          
          {/* <div className="whatsapp-container">
            <WhatsappButton phoneNumber={business.whatsapp} />
          </div> */}

          <button onClick={() => window.open(`/${business.establishmentName.replace(/\s+/g, '-')}`, '_blank')}>
            Ingresar
          </button>
        </div>
      ))}
    </div>
  );
};

export default BusinessList;

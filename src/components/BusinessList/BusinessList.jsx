import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore'; 
import { db } from '../../firebase'; 
import businessPage from '../../assets/businessPage.jpeg'; 
import './BusinessList.css'; 
import '../Whatsapp/Whatsapp.css';

const BusinessList = ({ category, userLocation }) => {
  const [businesses, setBusinesses] = useState([]);
  const [distances, setDistances] = useState({}); // Estado para almacenar distancias calculadas
  const Maps_ApiKey = import.meta.env.VITE_MAPS_APIKEY;

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

  // Obtener los negocios desde Firebase
  useEffect(() => {
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

  // Función para geocodificar una dirección
  const geocodeAddress = async (address) => {
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${Maps_ApiKey}`);
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

  // Recalcular las distancias cuando la ubicación del usuario o los negocios cambian
  useEffect(() => {
    if (userLocation && businesses.length > 0) {
      const newDistances = {};
      const promises = businesses.map(async (business) => {
        if (business.address) {
          try {
            const businessLocation = await geocodeAddress(business.address);
            const distance = calculateDistance(
              userLocation.latitude, 
              userLocation.longitude, 
              businessLocation.lat, 
              businessLocation.lng
            );
            newDistances[business.id] = distance.toFixed(2);
          } catch (error) {
            console.error(`Error al calcular la distancia para ${business.establishmentName}:`, error);
          }
        }
      });
      
      Promise.all(promises).then(() => {
        setDistances(newDistances); // Actualizar distancias cuando todas hayan sido calculadas
      });
    }
  }, [userLocation, businesses]);

  // Filtrar por rubro seleccionado o mostrar todos los negocios si se elige "Todos los deportes"
 const filteredAndSortedBusinesses = [...businesses]
  .filter(business => 
    business.businessType && 
    (Array.isArray(business.businessType) ? business.businessType.length > 0 : business.businessType.trim() !== '') &&
    (category === 'All' || category === 'Todos los deportes' || business.businessType.includes(category))
  )
  .sort((a, b) => {
    const aDistance = distances[a.id];
    const bDistance = distances[b.id];
    
    if (aDistance && bDistance) {
      return aDistance - bDistance;
    } else if (aDistance) {
      return -1;
    } else if (bDistance) {
      return 1;
    }
    return 0;
  });


  return (
    <div className="business-list">
      {filteredAndSortedBusinesses.map((business) => (
        <div key={business.id} className="business-card">
          <img className="business-image" src={business.backgroundImageUrl || businessPage} alt={`${business.establishmentName} banner`}/>
          <h3>{business.establishmentName}</h3>
          <hr />
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

          <button  className="login-button-card" onClick={() => window.open(`/${business.establishmentName.replace(/\s+/g, '-')}`, '_blank')}>
            VER DISPONIBILIDAD
          </button>
        </div>
      ))}
    </div>
  );
};

export default BusinessList;


import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import businessPage from '../../assets/businessPage.jpeg';
import './BusinessList.css';
import '../Whatsapp/Whatsapp.css';

const BusinessList = ({ category, userLocation, searchTerm }) => {
  const [businesses, setBusinesses] = useState([]);
  const [distances, setDistances] = useState({});
  const [visibleCount, setVisibleCount] = useState(8);
  const Maps_ApiKey = import.meta.env.VITE_MAPS_APIKEY;

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'owners'));
        const businessData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setBusinesses(businessData);
      } catch (error) {
        console.error('Error al obtener negocios:', error);
      }
    };
    fetchBusinesses();
  }, []);

  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${Maps_ApiKey}`
      );
      if (!response.ok) throw new Error('Error en la respuesta de la API');
      const data = await response.json();
      if (data.results.length > 0) {
        return {
          lat: data.results[0].geometry.location.lat,
          lng: data.results[0].geometry.location.lng,
        };
      } else {
        throw new Error('Dirección no encontrada');
      }
    } catch (error) {
      console.error(`Error geocodificando "${address}":`, error);
      return null;
    }
  };

  useEffect(() => {
    if (!userLocation || businesses.length === 0) return;

    const fetchDistances = async () => {
      const newDistances = {};
      const promises = businesses.map(async (business) => {
        if (!business.address) return;
        const businessLocation = await geocodeAddress(business.address);
        if (businessLocation) {
          const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            businessLocation.lat,
            businessLocation.lng
          );
          newDistances[business.id] = distance.toFixed(2);
        }
      });

      await Promise.all(promises);
      setDistances(newDistances);
    };

    fetchDistances();
  }, [userLocation, businesses]);

  const filteredAndSortedBusinesses = [...businesses]
    .filter((business) => {
      const matchesCategory =
        category === 'All' ||
        category === 'Todos los deportes' ||
        category === 'Todos' || // Agrega esta línea si es necesario
        !category || // Si no hay categoría seleccionada
        (business.businessType && business.businessType.includes(category));

      const matchesName =
        !searchTerm ||
        business.establishmentName.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesName;
    })
    .sort((a, b) => {
      const aDistance = distances[a.id];
      const bDistance = distances[b.id];

      if (aDistance && bDistance) return aDistance - bDistance;
      if (aDistance) return -1;
      if (bDistance) return 1;
      return 0;
    });

  const visibleBusinesses = filteredAndSortedBusinesses.slice(0, visibleCount);
  return (
    <div className="business-list">
      {visibleBusinesses.length > 0 ? (
        visibleBusinesses.map((business) => (
          <div key={business.id} className="business-card">
            <img
              className="business-image"
              src={business.backgroundImageUrl || businessPage}
              alt={`${business.establishmentName} banner`}
            />
            <h3>{business.establishmentName}</h3>
            <hr />
            <p>
              {Array.isArray(business.businessType)
                ? business.businessType.join(', ')
                : business.businessType || 'Sin rubro'}
            </p>

            {business.address && (
              <p className="business-address">
                <i className="fas fa-map-marker-alt"></i> {business.address}
              </p>
            )}

            {userLocation && business.address && distances[business.id] && (
              <p>Distancia: {distances[business.id]} km</p>
            )}

            <button
              className="login-button-card"
              onClick={() =>
                window.open(
                  `/${business.establishmentName.replace(/\s+/g, '-')}`,
                  '_blank'
                )
              }
            >
              VER DISPONIBILIDAD
            </button>
          </div>
        ))
      ) : (
        <p>No se encontraron negocios que coincidan con la búsqueda.</p>
      )}

      <div className="pagination-buttons">
        {visibleCount < filteredAndSortedBusinesses.length && (
          <button onClick={() => setVisibleCount(visibleCount + 8)}>Ver más</button>
        )}
        {visibleCount > 8 && (
          <button onClick={() => setVisibleCount(Math.max(8, visibleCount - 8))}>
            Ver menos
          </button>
        )}
      </div>
    </div>
  );
};

export default BusinessList;

import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import businessPage from '../../assets/businessPage.jpeg';
import './BusinessList.css';

const BusinessList = ({ category, userLocation, searchTerm }) => {
  const [businesses, setBusinesses] = useState([]);
  const [distances, setDistances] = useState({});
  const [visibleCount, setVisibleCount] = useState(8); // Mostrar 8 inicialmente
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
        console.error('Error fetching businesses:', error);
      }
    };
    fetchBusinesses();
  }, []);

  const filteredAndSortedBusinesses = [...businesses]
    .filter((business) => {
      const matchesCategory =
        category === 'All' ||
        category === 'Todos los deportes' ||
        (business.businessType && business.businessType.includes(category));
      const matchesName =
        !searchTerm ||
        business.establishmentName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      return matchesCategory && matchesName;
    })
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
      {filteredAndSortedBusinesses.slice(0, visibleCount).map((business) => (
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
      ))}

      {/* Botón "Ver más" */}
      {visibleCount < filteredAndSortedBusinesses.length && (
        <button className="see-more-button" onClick={() => setVisibleCount(visibleCount + 4)}>
          Ver más ↓
        </button>
      )}
    </div>
  );
};

export default BusinessList;


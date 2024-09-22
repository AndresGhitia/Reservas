import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore'; 
import { db } from '../../firebase'; 
import businessPage from '../../assets/businessPage.jpeg'; 
import './BusinessList.css'; 
import WhatsappButton from '../WhatsappButton/WhatsappButton'; 

const BusinessList = ({ category }) => {
  const [businesses, setBusinesses] = useState([]);

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

  // Ordena los negocios por relevancia
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
          
          {/* Usamos el componente de WhatsApp */}
          <WhatsappButton phoneNumber={business.whatsapp} />
          
          <button onClick={() => window.open(`/${business.establishmentName.replace(/\s+/g, '-')}`, '_blank')}>
            Ingresar
          </button>
        </div>
      ))}
    </div>
  );
};

export default BusinessList;

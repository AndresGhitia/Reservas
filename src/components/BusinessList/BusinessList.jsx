import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore'; 
import { db } from '../../firebase'; 
import businessPage from '../../assets/businessPage.jpeg'; 
import './BusinessList.css'; 

const BusinessList = () => {
  const [businesses, setBusinesses] = useState([]);

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'owners'));
        if (querySnapshot.empty) {
          console.log('No matching documents.');
        } else {
          const businessData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          console.log("Fetched data: ", businessData); // Verifica los datos obtenidos
          setBusinesses(businessData);
        }
      } catch (error) {
        console.error("Error fetching businesses:", error);
      }
    };
  
    fetchBusinesses();
  }, []);
  
  

  return (
    <div className="business-list">
      {businesses.map((business) => (
        <div key={business.id} className="business-card">
<img
  src={business.backgroundImageUrl || businessPage}
  alt={`${business.establishmentName} banner`}
  className="business-image"
/>
          <h3>{business.establishmentName}</h3>
          <p>{business.businessType}</p>
          <button onClick={() => window.open(`/${business.establishmentName.replace(/\s+/g, '-')}`, '_blank')}>Ingresar</button>
          </div>
      ))}
    </div>
  );
};

export default BusinessList;

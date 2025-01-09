import React, { useState, useEffect, useRef } from 'react';
import './Home.css';
import Header from '../../components/Header/Header';
import ExploreRubro from '../../components/ExploreMenu/ExploreRubro';
import BusinessList from '../../components/BusinessList/BusinessList';
import HomeFilter from '../../components/HomeFilter/HomeFilter';

const Home = () => {
  const [category, setCategory] = useState("All");
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);

  const businessListRef = useRef(null);

  

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
        },
        (err) => setError(err.message)
      );
    } else {
      setError("Tu navegador no soporta geolocalización");
    }
  }, []);

  return (
    <div>
      <Header />
      {error && <p className="error-message">{error}</p>}
      
<HomeFilter
  userLocation={userLocation}
  setUserLocation={setUserLocation}
  businessListRef={businessListRef}
  category={category}
  setCategory={setCategory}
/>

      
      <ExploreRubro category={category} 
                    setCategory={setCategory} />

      <div ref={businessListRef}>
        <BusinessList category={category} userLocation={userLocation} />
      </div>
    </div>
  );
};

export default Home;

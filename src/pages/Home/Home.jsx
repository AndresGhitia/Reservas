import React, { useState, useEffect } from 'react';
import './Home.css';
import Header from '../../components/Header/Header';
import ExploreRubro from '../../components/ExploreMenu/ExploreRubro';
import BusinessList from '../../components/BusinessList/BusinessList';
import Location from '../../components/Location/Location';

const Home = () => {
  const [category, setCategory] = useState("All");
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);
  const Maps_ApiKey = import.meta.env.VITE_MAPS_APIKEY;

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
      <Location userLocation={userLocation} setUserLocation={setUserLocation} />
      <ExploreRubro category={category} setCategory={setCategory} />
      <BusinessList category={category} userLocation={userLocation} />
    </div>
  );
};

export default Home;



const Maps_ApiKey = import.meta.env.VITE_MAPS_APIKEY;

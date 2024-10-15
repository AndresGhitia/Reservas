import React, { useState, useEffect } from 'react';
import './Home.css';
import Header from '../../components/Header/Header';
import ExploreRubro from '../../components/ExploreMenu/ExploreRubro';
import BusinessList from '../../components/BusinessList/BusinessList';

const Home = () => {
  const [category, setCategory] = useState("All");
  const [userLocation, setUserLocation] = useState(null); 
  const [error, setError] = useState(null); 

  // Solicitar permiso para acceder a la ubicación cuando el componente se monta
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude }); // Guardar la latitud y longitud en el estado
    //      console.log('Location: '+ userLocation)
        },
        (err) => {
          setError(err.message); // Manejar errores si el usuario deniega el acceso o algo sale mal
        }
      );
    } else {
      setError("Tu navegador no soporta geolocalización");
    }
  }, []); // Solo se ejecuta una vez, al montar el componente

  useEffect(() => {
    if (userLocation) {
      // Ver la ubicación en la consola de forma legible
//      console.log('Ubicación del usuario:', userLocation);
  //    console.log('Latitud:', userLocation.latitude);
    //  console.log('Longitud:', userLocation.longitude);
    } else {
  //    console.log('Ubicación: null');
    }
  }, [userLocation]);
  

  return (
    <div>
      <Header />
      {/* Mostrar mensaje de error si ocurre un problema con la geolocalización */}
      {error && <p className="error-message">{error}</p>}
      
      {/* Puedes usar `userLocation` para enviar la ubicación a otros componentes si lo deseas */}
      <ExploreRubro category={category} setCategory={setCategory} />
      <BusinessList category={category} userLocation={userLocation} />
    </div>
  );
};

export default Home;

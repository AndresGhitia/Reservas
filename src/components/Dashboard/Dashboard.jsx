import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase'; 
import './Dashboard.css';

function Dashboard() {
  const { establishmentName } = useParams(); // Obtener el parámetro de la URL
  const decodedName = decodeURIComponent(establishmentName).replace(/-/g, ' '); // Decodificar y reemplazar guiones
  const [ownerData, setOwnerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const docRef = doc(db, 'owners', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setOwnerData(docSnap.data());
          } else {
            console.error("No se encontró el documento del propietario.");
            setError("No se encontraron datos del propietario.");
          }
        } else {
          console.error("No se encontró el usuario autenticado.");
          setError("Usuario no autenticado.");
        }
      } catch (error) {
        console.error("Error al obtener los datos del propietario: ", error);
        setError("Hubo un error al cargar los datos. Intenta nuevamente más tarde.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!ownerData) {
    return <div>No se encontraron datos del propietario.</div>;
  }

  return (
    <div>
      <h1>Hola, {ownerData.ownerName}</h1>
      <p>Bienvenido al panel de administración de {decodedName}.</p>
      {/* Aquí puedes agregar más contenido para el Dashboard */}
    </div>
  );
}

export default Dashboard;

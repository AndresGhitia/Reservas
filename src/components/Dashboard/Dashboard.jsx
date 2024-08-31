import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import './Dashboard.css';

function Dashboard() {
  const { establishmentName } = useParams(); 
  const decodedName = decodeURIComponent(establishmentName).replace(/-/g, ' ');
  const [ownerData, setOwnerData] = useState(null);
  const [spaces, setSpaces] = useState([]);
  const [newSpaceName, setNewSpaceName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uniqueError, setUniqueError] = useState(null); // Error para nombre único

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          // Fetch owner data
          const docRef = doc(db, 'owners', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setOwnerData(docSnap.data());

            // Fetch spaces for the owner
            const spacesRef = collection(docRef, 'spaces');
            const spacesSnap = await getDocs(spacesRef);
            const spacesList = spacesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setSpaces(spacesList);
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

  const handleAddSpace = async () => {
    if (newSpaceName.trim() === "") return;
    setUniqueError(null); // Limpiar cualquier error anterior

    try {
      const user = auth.currentUser;
      if (user) {
        const spacesRef = collection(db, 'owners', user.uid, 'spaces');
        const q = query(spacesRef, where("name", "==", newSpaceName));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          setUniqueError("Ya existe un espacio con este nombre."); // Mostrar error si el nombre no es único
        } else {
          const docRef = await addDoc(spacesRef, { name: newSpaceName });
          setSpaces(prevSpaces => [...prevSpaces, { id: docRef.id, name: newSpaceName }]);
          setNewSpaceName(""); // Clear the input field after adding
        }
      }
    } catch (error) {
      console.error("Error al agregar un nuevo espacio: ", error);
    }
  };

  const handleDeleteSpace = async (spaceId) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const spaceDocRef = doc(db, 'owners', user.uid, 'spaces', spaceId);
        await deleteDoc(spaceDocRef);
        setSpaces(prevSpaces => prevSpaces.filter(space => space.id !== spaceId));
      }
    } catch (error) {
      console.error("Error al borrar el espacio: ", error);
    }
  };

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
      <Link to="/" className="home-button">Home</Link>
      
      <div className="spaces-section">
        <h2>Espacios / Canchas</h2>
        <ul>
          {spaces.map((space) => (
            <li key={space.id}>
              {space.name} 
              <button onClick={() => handleDeleteSpace(space.id)}>Borrar</button>
            </li>
          ))}
        </ul>
        <input 
          type="text" 
          placeholder="Nombre del nuevo espacio" 
          value={newSpaceName} 
          onChange={(e) => setNewSpaceName(e.target.value)} 
        />
        <button onClick={handleAddSpace}>Agregar Espacio</button>
        {uniqueError && <p className="error">{uniqueError}</p>}
      </div>
    </div>
  );
}

export default Dashboard;

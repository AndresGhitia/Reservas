import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";
import { useLocation, useNavigate } from 'react-router-dom';
import { useJsApiLoader } from '@react-google-maps/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './RecoverForm.module.css';

const RecoverForm = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email'); 
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    ownerName: '',
    establishmentName: '',
    address: '',
    businessType: '',
    whatsapp: '',
  });
  const [isUser, setIsUser] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [businessType, setBusinessType] = useState([]);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const autocompleteServiceRef = useRef(null);
  const availableBusinessTypes = ['Football', 'Paddle', 'Tennis', 'Hockey', 'Volleyball', 'Handball'];
  const Maps_ApiKey = import.meta.env.VITE_MAPS_APIKEY;
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: Maps_ApiKey,
    libraries: ['places'],
  });

  useEffect(() => {
    if (isLoaded && !autocompleteServiceRef.current) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
    }
  }, [isLoaded]);

  useEffect(() => {
    const checkEmail = async () => {
      setIsLoading(true); // Indica que está cargando
      try {
        const userQuery = query(collection(db, 'users'), where('email', '==', email));
        const userSnapshot = await getDocs(userQuery);
  
        if (!userSnapshot.empty) {
          setIsUser(true);
        } else {
          const ownerQuery = query(collection(db, 'owners'), where('establishmentEmail', '==', email));
          const ownerSnapshot = await getDocs(ownerQuery);
  
          if (ownerSnapshot.empty) {
            throw new Error('El correo electrónico no está registrado.');
          }
  
          setIsUser(false);
        }
      } catch (err) {
        setError(err.message || 'Error al verificar el correo electrónico.');
      } finally {
        setIsLoading(false); // Finaliza la carga
      }
    };
  
    if (email) {
      checkEmail();
    }
  }, [email]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
  
    if (name === 'whatsapp') {
      // Eliminar cualquier cosa que no sea un número (incluyendo espacios)
      const cleanedValue = value.replace(/\D/g, ''); // Solo dejar números
      setFormData((prev) => ({
        ...prev,
        [name]: cleanedValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  
    // Autocompletar la dirección de la misma forma que lo hacías antes
    if (name === 'address' && autocompleteServiceRef.current) {
      autocompleteServiceRef.current.getPlacePredictions(
        { input: value },
        (predictions) => {
          setAddressSuggestions(predictions || []);
        }
      );
    }
  };
  

  const handleBusinessTypeChange = (type) => {
    setBusinessType((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      if (isUser) {
        const userQuery = query(collection(db, 'users'), where('email', '==', email));
        const userSnapshot = await getDocs(userQuery);
        const userId = userSnapshot.docs[0].id;
        const userRef = doc(db, 'users', userId);

        await updateDoc(userRef, {
          firstName: formData.firstName || '',
          lastName: formData.lastName || '',
          status: 'enabled',
          statusHistory: arrayUnion(`enabled: ${new Date().toISOString()}`),
        });
      } else {
        const ownerQuery = query(collection(db, 'owners'), where('establishmentEmail', '==', email));
        const ownerSnapshot = await getDocs(ownerQuery);
        const ownerId = ownerSnapshot.docs[0].id;
        const ownerRef = doc(db, 'owners', ownerId);

        await updateDoc(ownerRef, {
          ownerName: formData.ownerName || '',
          establishmentName: formData.establishmentName || '',
          address: formData.address || '',
          businessType: businessType,
          whatsapp: formData.whatsapp ? '11' + formData.whatsapp : '',  // Solo agregar '11' si hay un valor en formData.whatsapp
          status: 'enabled',
          expdate: serverTimestamp(),
          statusHistory: arrayUnion(`enabled: ${new Date().toISOString()}`),
        });
      }

      await sendPasswordResetEmail(auth, email);
      alert('Datos actualizados correctamente. Revisa tu correo para restablecer tu contraseña.');
      navigate('/');
    } catch (err) {
      setError(err.message || 'Error al actualizar los datos.');
    } finally {
      setLoading(false);
    }
  };

  


  if (error) {
    return <p>Error: {error}</p>; // Mostrar error si ocurre
  }

  if (isLoading) {    return (
      <div>
        <LoadingSpinner />
      </div>
    );
  }
  
  
  return (
    
    <div className={styles.container}>
      
      <h2 className={styles.title}>Recuperar cuenta</h2>
      {error && <p className={styles.error}>{error}</p>} {/* Muestra el error si existe */}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {isUser ? (
          // Solo mostrar Nombre y Apellido si isUser es true
          <>
            <div className={styles.field}>
              <label className={styles.label}>Nombre</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Apellido</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
          </>
        ) : (
          // Mostrar los demás campos si isUser es false
          <>
            <div className={styles.field}>
              <label className={styles.label}>Nombre del Propietario</label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Nombre del Establecimiento</label>
              <input
                type="text"
                name="establishmentName"
                value={formData.establishmentName}
                onChange={handleChange}
                className={styles.input}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Dirección</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className={styles.input}
              />
              {addressSuggestions.map((suggestion) => (
                <div
                  key={suggestion.place_id}
                  className={styles.suggestion}
                  onClick={() => setFormData({ ...formData, address: suggestion.description })}
                >
                  {suggestion.description}
                </div>
              ))}
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Tipo de Negocio</label>
              {availableBusinessTypes.map((type) => (
                <div key={type} className={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    checked={businessType.includes(type)}
                    onChange={() => handleBusinessTypeChange(type)}
                  />
                  {type}
                </div>
              ))}
            </div>
            <div className={styles.field}>
  <label className={styles.label}>WhatsApp</label>
  <div className={styles.whatsappInputContainer}>
    <span className={styles.prefix}>11</span>
    <input
      type="text"
      name="whatsapp"
      value={formData.whatsapp}
      onChange={(e) => handleChange(e)}
      className={styles.input}
      placeholder="Número de WhatsApp"
    />
  </div>
</div>
          </>
        )}
        <button type="submit" disabled={loading} className='editdata-button'>
          {loading ? 'Cargando...' : 'Enviar'}
        </button>

        <button className='editdata-button' href="/"   onClick={() => navigate("/")} >
         Salir
        </button> 
      </form>
    </div>
  );
  
  
};

export default RecoverForm;


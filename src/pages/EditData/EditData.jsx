import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { useLocation, useNavigate } from 'react-router-dom';
import { useJsApiLoader } from '@react-google-maps/api';
import './EditData.css';

const EditData = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email');
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    address: '',
    businessType: [],
    establishmentName: '',
    ownerName: '',
    whatsapp: '',
    firstName: '',
    lastName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const autocompleteServiceRef = useRef(null);
  const availableBusinessTypes = ['Football', 'Paddle', 'Tennis', 'Hockey', 'Volley', 'Handball'];
  const [businessType, setBusinessType] = useState([]);
  const [isOwner, setIsOwner] = useState(false); // Estado para saber si es un owner o un user
  const navigate = useNavigate();
  const Maps_ApiKey = import.meta.env.VITE_MAPS_APIKEY;
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: Maps_ApiKey,
    libraries: ['places'],
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!email) {
        setError("No se proporcionó un email válido.");
        return;
      }

      try {
        // Verificar en la colección 'owners'
        const ownerQuery = query(collection(db, 'owners'), where('establishmentEmail', '==', email));
        const ownerSnapshot = await getDocs(ownerQuery);

        if (!ownerSnapshot.empty) {
          const userData = ownerSnapshot.docs[0].data();
          console.log('Datos del propietario:', userData);

          // Si pertenece a 'owners', cargar todos los campos de negocio
          setFormData({
            address: userData.address || '',
            businessType: userData.businessType || [],
            establishmentName: userData.establishmentName || '',
            ownerName: userData.ownerName || '',
            whatsapp: userData.whatsapp || '',
          });

          setInputValue(userData.address || '');
          setBusinessType(userData.businessType || []);
          setIsOwner(true); // Marcamos que es un propietario
          return;
        }

        // Verificar en la colección 'users' si no pertenece a 'owners'
        const userQuery = query(collection(db, 'users'), where('email', '==', email));
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          console.log('Datos del usuario:', userData);

          // Si pertenece a 'users', cargar solo los campos de nombre y apellido
          setFormData({
            address: '',
            businessType: '',
            establishmentName: '',
            ownerName: '',
            whatsapp: '',
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
          });

          setIsOwner(false); // Marcamos que es un usuario
          return;
        }

        setError("No se encontraron datos para el email proporcionado.");
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
        setError("Hubo un error al cargar los datos.");
      }
    };

    fetchUserData();
  }, [email]);

  useEffect(() => {
    if (isLoaded && !autocompleteServiceRef.current) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
    }
  }, [isLoaded]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);

    if (value && autocompleteServiceRef.current) {
      autocompleteServiceRef.current.getPlacePredictions({ input: value }, (predictions, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
          setPredictions(predictions);
        } else {
          setPredictions([]);
        }
      });
    } else {
      setPredictions([]);
    }
  };

  const handlePredictionClick = (prediction) => {
    setInputValue(prediction.description);
    setFormData((prev) => ({
      ...prev,
      address: prediction.description,
    }));
    setPredictions([]);
  };

  const handleBusinessTypeChange = (e) => {
    const selectedType = e.target.value;

    if (selectedType && !businessType.includes(selectedType)) {
      const updatedBusinessType = [...businessType, selectedType];

      setBusinessType(updatedBusinessType);
      setFormData((prev) => ({
        ...prev,
        businessType: updatedBusinessType,
      }));
    }
  };

  const removeBusinessType = (type) => {
    const updatedBusinessType = businessType.filter((item) => item !== type);

    setBusinessType(updatedBusinessType);
    setFormData((prev) => ({
      ...prev,
      businessType: updatedBusinessType,
    }));
  };

  const handleWhatsAppChange = (e) => {
    const value = e.target.value;
    if (!value.startsWith('+54 11')) {
      setFormData((prev) => ({
        ...prev,
        whatsapp: '+54 11' + value.replace('+54 11', ''),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        whatsapp: value,
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!email) {
      setError('El correo electrónico no está disponible.');
      return;
    }
  
    // Verificar si el correo electrónico pertenece a la colección 'owners'
    const ownerQuery = query(collection(db, 'owners'), where('establishmentEmail', '==', email));
    const ownerSnapshot = await getDocs(ownerQuery);
  
    // Verificar si el correo electrónico pertenece a la colección 'users'
    const userQuery = query(collection(db, 'users'), where('email', '==', email));
    const userSnapshot = await getDocs(userQuery);
  
    if (ownerSnapshot.empty && userSnapshot.empty) {
      setError('No se encontró un documento con ese correo electrónico.');
      return;
    }
  
    setLoading(true);
  
    try {
      if (!ownerSnapshot.empty) {
        // El correo electrónico pertenece a la colección 'owners'
        const ownerDocId = ownerSnapshot.docs[0].id;
        const ownerDocRef = doc(db, 'owners', ownerDocId);
  
        // Actualizar todos los campos
        await updateDoc(ownerDocRef, {
          address: formData.address || '',
          businessType: formData.businessType || [],
          establishmentName: formData.establishmentName || '',
          ownerName: formData.ownerName || '',
          whatsapp: formData.whatsapp || '',
        });
      } else if (!userSnapshot.empty) {
        // El correo electrónico pertenece a la colección 'users'
        const userDocId = userSnapshot.docs[0].id;
        const userDocRef = doc(db, 'users', userDocId);
  
        // Actualizar solo 'nombre' y 'apellido'
        await updateDoc(userDocRef, {
          firstName: formData.firstName || '',
          lastName: formData.lastName || '',
        });
      }
  
      setLoading(false);
      alert('Datos actualizados correctamente.');
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Hubo un error al actualizar los datos.');
    }
  };

  return (
    <div className="editdata-container">
      <h2>Actualiza los datos de tu cuenta</h2>
      {error && <p>{error}</p>}
      <form onSubmit={handleSubmit}>
        {/* Campos para 'users' */}
        {!isOwner && (
          <>
            <div className="form-group-data">
              <label>Nombre</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required={formData.firstName !== ''}
              />
            </div>
            <div className="form-group-data">
              <label>Apellido</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required={formData.lastName !== ''}
              />
            </div>
          </>
        )}

        {/* Campos para 'owners' */}
        {isOwner && (
          <>
            <div className="form-group-data">
              <label>Nombre del Establecimiento</label>
              <input
                type="text"
                name="establishmentName"
                value={formData.establishmentName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group-data">
              <label>Nombre del Propietario</label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group-data">
              <label>Dirección</label>
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputChange}
                required
              />
              <ul>
                {predictions.map((prediction) => (
                  <li key={prediction.place_id} onClick={() => handlePredictionClick(prediction)}>
                    {prediction.description}
                  </li>
                ))}
              </ul>
            </div>
            <div className="form-group-data">
              <label>WhatsApp</label>
              <input
                type="text"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleWhatsAppChange}
              />
            </div>
            <div className="form-group-data">
          <label> Selecciona un deporte</label>
          <select onChange={handleBusinessTypeChange}>
            <option value="">Selecciona un deporte</option>
            {availableBusinessTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <div className="selected-business-data">
            {businessType.map((type) => (
              <span key={type} className="business-data">
                {type} <button type="button" onClick={() => removeBusinessType(type)}>✖</button>
              </span>
            ))}
          </div>
        </div>
          </>
        )}

<div className='editdata-buttons'> 
          <button className='editdata-button' type="submit" disabled={loading}> {loading ? 'Cargando...' : 'Enviar'} </button>
           <button className='editdata-button' href="/"   onClick={() => navigate("/")} > Descartar cambios</button> 
        </div>
      </form>
    </div>
  );
};

export default EditData;

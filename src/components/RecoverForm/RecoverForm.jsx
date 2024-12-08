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
import { useLocation } from 'react-router-dom';
import { useJsApiLoader } from '@react-google-maps/api';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";

import './RecoverForm.css';

const RecoverForm = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email'); // Obtener el correo del query param
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    address: '',
    businessType: '',
    establishmentName: '',
    ownerName: '',
    whatsapp: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const autocompleteServiceRef = useRef(null);

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

  const handlePasswordReset = async (e) => {
  //  e.preventDefault();
    console.log("Iniciando proceso de restablecimiento de contraseña...");
    console.log("Email ingresado:", email);

    try {
        await sendPasswordResetEmail(auth, email);
        // console.log("Correo de restablecimiento enviado exitosamente.");
        // setMessage("Se ha enviado un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada,  Asegúrese de revisar su carpeta de correo no deseado o spam si no ha recibido nuestro correo electrónico.");
        // setError(""); // Limpia cualquier mensaje de error
    } catch (error) {
        console.error("Error al enviar el correo de restablecimiento:", error);
        setMessage(""); // Limpia cualquier mensaje previo de éxito
        // setError("No se pudo enviar el correo. Verifica el email ingresado.");
    }
};


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('El correo electrónico no está disponible.');
      return;
    }

    setLoading(true);

    try {
      const q = query(collection(db, 'owners'), where('establishmentEmail', '==', email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('No se encontró un documento con ese correo electrónico.');
      }

      const docId = querySnapshot.docs[0].id;
      const userDocRef = doc(db, 'owners', docId);
      const currentTimestamp = serverTimestamp();

      await updateDoc(userDocRef, {
        address: formData.address || '',
        businessType: formData.businessType || '',
        establishmentName: formData.establishmentName || '',
        ownerName: formData.ownerName || '',
        whatsapp: formData.whatsapp || '',
        status: 'enabled',
        expdate: currentTimestamp,
        statusHistory: arrayUnion(`enabled: ${new Date().toISOString()}`),
      });

      setLoading(false);
      alert('Datos actualizados correctamente. Se ha enviado un enlace para restablecer tu contraseña. Revisa tu bandeja de entrada,  Asegúrese de revisar su carpeta de correo no deseado o spam si no ha recibido nuestro correo electrónico.');

      handlePasswordReset(email);

    } catch (err) {
      setLoading(false);
      setError(err.message || 'Hubo un error al actualizar los datos.');
    }
  };

  return (
    <div>
      <h2>Recuperar y Actualizar Datos</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Dirección</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Buscar dirección..."
              value={inputValue}
              onChange={handleInputChange}
              required
            />
            {predictions.length > 0 && (
              <ul className="autocomplete-suggestions">
                {predictions.map((prediction) => (
                  <li key={prediction.place_id} onClick={() => handlePredictionClick(prediction)}>
                    {prediction.description}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div>
          <label>Número de WhatsApp</label>
          <input
            type="text"
            name="whatsapp"
            placeholder="+54 11..."
            value={formData.whatsapp}
            onChange={handleWhatsAppChange}
            required
          />
        </div>
        <div>
          <label>Tipo de Negocio</label>
          <input
            type="text"
            name="businessType"
            value={formData.businessType}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Nombre del Establecimiento</label>
          <input
            type="text"
            name="establishmentName"
            value={formData.establishmentName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Nombre del Propietario</label>
          <input
            type="text"
            name="ownerName"
            value={formData.ownerName}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Cargando...' : 'Actualizar'}
        </button>
      </form>
      <a href="/">Regresar al inicio</a>
    </div>
  );
};

export default RecoverForm;

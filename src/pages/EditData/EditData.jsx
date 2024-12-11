import React, { useState, useEffect, useRef } from 'react';
import { db } from '../../firebase';
import { collection,query,where,getDocs,doc,updateDoc,} from 'firebase/firestore';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useJsApiLoader } from '@react-google-maps/api';
import styles from '../RecoverForm/RecoverForm.module.css';


const EditData = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email'); 
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
  const availableBusinessTypes =['Football', 'Paddle', 'Tenis', 'Hockey', 'Volley', 'Handball'];
  const [businessType, setBusinessType] = useState([]);
  const navigate = useNavigate();
  const Maps_ApiKey = import.meta.env.VITE_MAPS_APIKEY;
  const [userData, setUserData] = useState('')
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
        const q = query(collection(db, 'owners'), where('establishmentEmail', '==', email));
        const querySnapshot = await getDocs(q);
  
        if (querySnapshot.empty) {
          setError("No se encontraron datos para el email proporcionado.");
          return;
        }
  
        const userData = querySnapshot.docs[0].data();
        console.log('address: ' + userData.address);
  
        // Actualiza tanto formData como businessType
        setFormData({
          address: userData.address || '',
          businessType: userData.businessType || [], // Esto se asegura de no romper si no hay deportes.
          establishmentName: userData.establishmentName || '',
          ownerName: userData.ownerName || '',
          whatsapp: userData.whatsapp || '',
        });
  
        setInputValue(userData.address || '');
        // Actualiza directamente el estado de businessType
        setBusinessType(userData.businessType || []);
      } catch (error) {
        console.error("Error al obtener datos del usuario:", error);
        setError("Hubo un error al cargar los datos.");
      }
    };
  
    fetchUserData();
  }, [email]); // Ejecutar cuando cambie el email
  
  
  

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
  
      // Actualizar el estado de businessType
      setBusinessType(updatedBusinessType);
  
      // Sincronizar con formData
      setFormData((prev) => ({
        ...prev,
        businessType: updatedBusinessType,
      }));
    }
  };
  
  const removeBusinessType = (type) => {
    const updatedBusinessType = businessType.filter((item) => item !== type);
  
    // Actualizar el estado de businessType
    setBusinessType(updatedBusinessType);
  
    // Sincronizar con formData
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

  const handleEditData = async (e) => {
  //  e.preventDefault();
    console.log("Iniciando proceso de restablecimiento de contraseña...");
    console.log("Email ingresado:", email);

    try {
        // await sendPasswordResetEmail(auth, email);
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
    
    console.log("Formulario enviado. Verificando email...");
    console.log("Email recibido desde query param:", email); // Log del email recibido
    
    if (!email) {
      setError('El correo electrónico no está disponible.');
      console.error("Error: El correo electrónico no está disponible.");
      return;
    }
  
    // Verificar si hay al menos un deporte seleccionado
    if (businessType.length === 0) {
      setError("Debes seleccionar al menos un deporte.");
      console.error("Error: Debes seleccionar al menos un deporte.");
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
  
      await updateDoc(userDocRef, {
        address: formData.address || '',
        businessType: businessType,
        establishmentName: formData.establishmentName || '',
        ownerName: formData.ownerName || '',
        whatsapp: formData.whatsapp || '',
      });
  
  
      setLoading(false);
      alert('Datos actualizados correctamente.');
  
      handleEditData(email);

        // const dashboardUrl = `/dashboard/${encodeURIComponent(userData.establishmentName.replace(/\s+/g, '-'))}`;
        // navigate(dashboardUrl + '/list');

        // console.log('DashboardURL: '+ dashboardUrl)
    
    } catch (err) {
      setLoading(false);
      console.error("Error al actualizar los datos:", err);
      setError(err.message || 'Hubo un error al actualizar los datos.');
    }
  };
  

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Actualiza los datos de tu cuenta</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>Dirección</label>
          <div className={styles.relative}>
            <input
              type="text"
              placeholder="Buscar dirección..."
              value={inputValue}
              onChange={handleInputChange}
              className={styles.input}
              required
            />
            {predictions.length > 0 && (
              <ul className={styles.suggestions}>
                {predictions.map((prediction) => (
                  <li
                    key={prediction.place_id}
                    onClick={() => handlePredictionClick(prediction)}
                    className={styles.suggestionItem}
                  >
                    {prediction.description}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Número de WhatsApp</label>
          <input
            type="text"
            name="whatsapp"
            placeholder="+54 11..."
            value={formData.whatsapp}
            onChange={handleWhatsAppChange}
            className={styles.input}
            required
          />
        </div>
       
        <div className="form-group">
          <select onChange={handleBusinessTypeChange}>
            <option value="">Selecciona un deporte</option>
            {availableBusinessTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <div className="selected-business-types">
            {businessType.map((type) => (
              <span key={type} className="business-type">
                {type} <button type="button" onClick={() => removeBusinessType(type)}>✖</button>
              </span>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Nombre del Establecimiento</label>
          <input
            type="text"
            name="establishmentName"
            value={formData.establishmentName}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Nombre del Propietario</label>
          <input
            type="text"
            name="ownerName"
            value={formData.ownerName}
            onChange={handleChange}
            className={styles.input}
            required
          />
        </div>
        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? 'Cargando...' : 'Enviar'}
        </button>
      </form>
      <a href="/" className={styles.link}>
        Descartar cambios y cerrar
      </a>
    </div>
  );
};

export default EditData;


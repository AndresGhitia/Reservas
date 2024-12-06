import React, { useState } from 'react';
import { db } from '../../firebase'; 
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';
import './RecoverForm.css'; 

const RecoverForm = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get('email'); // Obtener el correo del parámetro 'email' en la URL
  
    console.log("Correo electrónico recibido:", email);
  const [formData, setFormData] = useState({
    address: '',
    businessType: '',
    establishmentName: '',
    ownerName: '',
    whatsapp: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Manejadores de eventos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);

  try {
    // Utilizamos el UID del usuario autenticado
    const userUid = user.uid; // Aquí debes utilizar el UID del usuario autenticado
    
    // Referencia al documento del usuario en la colección 'owners'
    const userDocRef = doc(db, 'owners', userUid);  // Documento basado en el UID del usuario

    // Actualizar el documento con los datos del formulario
    await updateDoc(userDocRef, {
      'Datos.address': formData.address,
      'Datos.businessType': formData.businessType,
      'Datos.establishmentName': formData.establishmentName,
      'Datos.ownerName': formData.ownerName,
      'Datos.whatsapp': formData.whatsapp,
      'Datos.status': 'enabled',  // El campo 'status' se pasa a 'enabled'
      'Datos.statusHistory': arrayUnion({
        status: 'enabled',
        timestamp: new Date().toISOString(), // Se añade el timestamp con el estado 'enabled'
      }),
    });

    setLoading(false);
    alert('Datos actualizados correctamente');
  } catch (err) {
    setLoading(false);
    setError('Hubo un error al actualizar los datos.');
    console.error(err);
  }
};


  return (
    <div>
      <h2>Recuperar y Actualizar Datos</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Dirección</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
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
        <div>
          <label>WhatsApp</label>
          <input
            type="text"
            name="whatsapp"
            value={formData.whatsapp}
            onChange={handleChange}
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

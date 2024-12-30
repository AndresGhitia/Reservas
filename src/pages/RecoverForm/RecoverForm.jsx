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
import styles from './RecoverForm.module.css';

const RecoverForm = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const email = queryParams.get('email'); 
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
  });
  const [isUser, setIsUser] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkEmail = async () => {
      try {
        const userQuery = query(collection(db, 'users'), where('email', '==', email));
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          setIsUser(true);
          return;
        }

        const ownerQuery = query(collection(db, 'owners'), where('establishmentEmail', '==', email));
        const ownerSnapshot = await getDocs(ownerQuery);

        if (ownerSnapshot.empty) {
          throw new Error('El correo electrónico no está registrado.');
        }

        setIsUser(false);
      } catch (err) {
        setError(err.message || 'Error al verificar el correo electrónico.');
      }
    };

    if (email) {
      checkEmail();
    }
  }, [email]);

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
          businessType: formData.businessType || [],
          whatsapp: formData.whatsapp || '',
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

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Recuperar cuenta</h2>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={handleSubmit} className={styles.form}>
        {isUser ? (
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
          </>
        )}
        <button type="submit" disabled={loading} className={styles.button}>
          {loading ? 'Cargando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
};

export default RecoverForm;

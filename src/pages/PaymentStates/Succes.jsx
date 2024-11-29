import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../../firebase'; 
import { collection, query, where, getDocs, updateDoc, Timestamp } from 'firebase/firestore';

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extraer los parámetros de la URL
  const queryParams = new URLSearchParams(location.search);
  const paymentId = queryParams.get('payment_id');
  const paymentStatus = queryParams.get('status');
  const customerEmail = decodeURIComponent(queryParams.get('external_reference'));

  // Función para buscar el usuario y actualizar la expdate
  const updateExpDate = async () => {
    try {
      const ownersRef = collection(db, 'owners');
      console.log('Buscando en Firestore con correo:', customerEmail);
      
      const q = query(ownersRef, where('establishmentEmail', '==', customerEmail));
      const querySnapshot = await getDocs(q);
  
      if (!querySnapshot.empty) {
        console.log('Documentos encontrados:', querySnapshot.size);
        const userDoc = querySnapshot.docs[0];
        const userDocRef = userDoc.ref;
  
        const currentDate = new Date();
        const newExpDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
  
        await updateDoc(userDocRef, {
          expdate: Timestamp.fromDate(newExpDate),
        });
  
        console.log('Fecha de expiración actualizada correctamente.');
      } else {
        console.error('No se encontró el usuario con ese email:', customerEmail);
      }
    } catch (error) {
      console.error('Error al actualizar la fecha de expiración:', error);
    }
  };
  

  // Llamar a la función cuando el pago sea aprobado
  useEffect(() => {
    if (paymentStatus === 'approved') {
      updateExpDate();
    }
  }, [paymentStatus]);

  return (
    <div>
      <h2>¡Pago realizado con éxito!</h2>
      <p>Detalles del pago:</p>
      <ul>
        <li>ID del pago: {paymentId}</li>
        <li>Correo del cliente: {customerEmail}</li>
        <li>Estado del pago: {paymentStatus}</li>
      </ul>
      <button onClick={() => navigate('/')}>Ahora puede iniciar sesión</button>
    </div>
  );
};

export default Success;

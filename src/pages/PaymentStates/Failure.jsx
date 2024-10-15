import React, { useEffect } from 'react';


const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extraer los parámetros de la URL
  const queryParams = new URLSearchParams(location.search);
  const paymentId = queryParams.get('payment_id');
  const paymentStatus = queryParams.get('status');
  const customerEmail = queryParams.get('external_reference'); // Suponiendo que se usa para el email del cliente

  // Función para buscar el usuario y actualizar la expdate
  const updateExpDate = async () => {
    try {
      const ownersRef = collection(db, 'owners');
      const q = query(ownersRef, where('establishmentEmail', '==', customerEmail)); // Buscar por email

      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        const userDocRef = userDoc.ref;

        // Sumar un mes a la fecha actual
        const currentDate = new Date();
        const newExpDate = new Date(currentDate.setMonth(currentDate.getMonth() + 1));

        // Actualizar el campo expdate
        await updateDoc(userDocRef, {
          expdate: Timestamp.fromDate(newExpDate),
        });

        console.log('Fecha de expiración actualizada correctamente.');
      } else {
        console.error('No se encontró el usuario con ese email.');
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

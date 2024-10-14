// src/pages/PaymentStates/Success.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Extraer los parámetros de la URL
  const queryParams = new URLSearchParams(location.search);
  const paymentId = queryParams.get('payment_id');
  const paymentStatus = queryParams.get('status');
  const customerEmail = queryParams.get('external_reference'); // Suponiendo que se usa para el email del cliente

  // Log de los datos del pago
  console.log('ID del pago:', paymentId);
  console.log('Correo del cliente:', customerEmail);
  console.log('Estado del pago:', paymentStatus);

  return (
    <div>
      <h2>¡Pago realizado con éxito!</h2>
      <p>Detalles del pago:</p>
      <ul>
        <li>ID del pago: {paymentId}</li>
        <li>Correo del cliente: {customerEmail}</li>
        <li>Estado del pago: {paymentStatus}</li>
      </ul>
      <button onClick={() => navigate('/')}>
        Ahora puede iniciar sesión
      </button>
    </div>
  );
};

export default Success;

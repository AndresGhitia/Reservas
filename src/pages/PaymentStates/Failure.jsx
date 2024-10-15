import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Failure = () => {

  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div>
      <h1>Pago Fallido</h1>
      <p>El pago no se pudo completar. Por favor, inténtalo nuevamente o contacta con soporte.</p>
      <button onClick={() => navigate('/')}>Volver a Book It!</button>
    </div>
  );
};

export default Failure;
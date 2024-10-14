import React, { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
import './LoginForm.css';
import RegisterForm from '../RegisterForm/RegisterForm';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import BuySubscription from '../BuySuscription/BuySuscription';
import { handleIntegrationMP } from '../../../MP/preference'; 

function LoginForm({ onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false); 
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      if (!user.emailVerified) {
        setError("Tu correo electrónico no ha sido verificado. Por favor, revisa tu correo y sigue las instrucciones para verificarlo.");
        return;
      }
  
      const ownerDoc = await getDoc(doc(db, 'owners', user.uid));
      if (ownerDoc.exists()) {
        const ownerData = ownerDoc.data();
        const expdate = ownerData.expdate && ownerData.expdate.toDate ? ownerData.expdate.toDate() : new Date(ownerData.expdate);
        const today = new Date();
  
        if (today > expdate) {
          setError("Tu cuenta ha vencido. Por favor, contacta a soporte para renovarla.");
          console.log('Usuario Vencido');
          setIsSubscriptionModalOpen(true); // Abrir el modal de suscripción
          await signOut(auth); // Cerrar la sesión si el usuario está vencido
  
          // Llamada para iniciar el proceso de pago, pasando el email del usuario
          const paymentData = await handleIntegrationMP(user.email); 
          if (paymentData) {
            // Redireccionar al link de pago de Mercado Pago
            console.log('LOG: '+paymentData)
            window.location.href = paymentData.init_point;
          }
          return;
        }
  
        onClose();
        setTimeout(() => {
          const dashboardUrl = `/dashboard/${encodeURIComponent(ownerData.establishmentName.replace(/\s+/g, '-'))}`;
          navigate(dashboardUrl);  // Navegar al dashboard
        }, 100);
      } else {
        setError("Usuario no encontrado, por favor verifica tus credenciales.");
      }
  
    } catch (error) {
      setError("Usuario o contraseña incorrectos, revísalos y vuelve a ingresarlos por favor");
    }
  };
  

  const openRegisterModal = () => {
    setShowRegister(true);
  };

  const closeRegisterModal = () => {
    setShowRegister(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleModalClose = () => {
    setIsSubscriptionModalOpen(false);
  };

  const handleRenewSubscription = async () => {
    console.log('Renovando suscripción...');

    // Llamar a la función para crear la preferencia de pago
    const preference = await handleIntegrationMP();

    if (preference) {
      // Redirigir al usuario a la URL de inicio de pago
      window.location.href = preference.init_point;
    } else {
      alert("Error al crear la preferencia de pago.");
    }

    // Cerrar el modal de suscripción
    setIsSubscriptionModalOpen(false);
  };

  return (
    <>
      <div className="modal">
        <div className="modal-content">
          <span className="close" onClick={onClose}>&times;</span>

          <h2 className="centered">Iniciar Sesión</h2>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Correo electrónico</label>
              <input
                type="email"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group password-group">
              <label>Contraseña</label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <span className="toggle-password" onClick={togglePasswordVisibility}>
                {showPassword ? '🙈' : '👁️'}
              </span>
            </div>
            <button type="submit">Login</button>
          </form>

          <button className="create-account-btn" onClick={openRegisterModal}>Crear Cuenta</button>
        </div>
      </div>

      {showRegister && <RegisterForm onClose={closeRegisterModal} />}

      {/* Modal de suscripción vencida */}
      <BuySubscription 
        isOpen={isSubscriptionModalOpen} 
        onClose={handleModalClose} 
        onRenew={handleRenewSubscription} 
      />
    </>
  );
}

export default LoginForm;

// LoginForm.jsx
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

      var ownerDoc = await getDoc(doc(db, 'owners', user.uid));

      if (!ownerDoc.exists()) {
        ownerDoc = await getDoc(doc(db, 'users', user.uid));
      }

      if (ownerDoc.exists()) {
        const ownerData = ownerDoc.data();
        const expdate = ownerData.expdate && ownerData.expdate.toDate ? ownerData.expdate.toDate() : new Date(ownerData.expdate);
        const today = new Date();

        if (today > expdate) {
          setError("Tu cuenta ha vencido. Por favor, contacta a soporte para renovarla.");
          setIsSubscriptionModalOpen(true);
          await signOut(auth);
          const paymentData = await handleIntegrationMP(user.email);
          if (paymentData) {
            window.location.href = paymentData.init_point;
          }
          return;
        }

        onClose();
        setTimeout(() => {
          const dashboardUrl = `/dashboard/${encodeURIComponent(ownerData.establishmentName.replace(/\s+/g, '-'))}`;
          navigate(dashboardUrl);
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
    const preference = await handleIntegrationMP();

    if (preference) {
      window.location.href = preference.init_point;
    } else {
      alert("Error al crear la preferencia de pago.");
    }

    setIsSubscriptionModalOpen(false);
  };

  return (
    <>
      <div className="modal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className='modal-header'>
              <p className="login-header">Bienvenido a Book-It</p>
              <span className="close" onClick={onClose}>&times;</span>
            </div>
            <div className='modal-body'>
              <section className='modal-login'>
                <h3>LOG IN</h3>
                <p>No tienes cuenta? <span className="join-now" onClick={openRegisterModal}>CREAR CUENTA</span></p>
              </section>

              {error && <p className="error">{error}</p>}
              <form onSubmit={handleLogin}>
                <div className="form-group">
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span className="toggle-password" onClick={togglePasswordVisibility}>
                    {showPassword ? '🙈' : '👁️'}
                  </span>
                </div>
                <button type="submit" className="login-button">LOG IN TO BOOK-IT</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {showRegister && <RegisterForm onClose={closeRegisterModal} />}

      <BuySubscription
        isOpen={isSubscriptionModalOpen}
        onClose={handleModalClose}
        onRenew={handleRenewSubscription}
      />
    </>
  );
}

export default LoginForm;

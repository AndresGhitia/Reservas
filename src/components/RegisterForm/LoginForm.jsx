import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebase';
import './LoginForm.css';
import RegisterForm from './RegisterForm';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';

function LoginForm({ onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
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
  
        onClose();
        setTimeout(() => {
          const dashboardUrl = `/dashboard/${encodeURIComponent(ownerData.establishmentName.replace(/\s+/g, '-'))}`;
          // navigate(dashboardUrl); // Descomenta esta línea si usas `react-router-dom`
        }, 100);
      } else {
        onClose();
      }
  
    } catch (error) {
      setError("Usuario o contraseña incorrectos, revisalos y vuelve a ingresarlos por favor");
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
    </>
  );
}

export default LoginForm;

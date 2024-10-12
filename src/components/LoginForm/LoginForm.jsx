import React, { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
import './LoginForm.css';
import RegisterForm from '../RegisterForm/RegisterForm';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { parse } from 'date-fns';
import { es } from 'date-fns/locale';

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
        await signOut(auth);
        return;
      }
  
      const ownerDoc = await getDoc(doc(db, 'owners', user.uid));
      if (ownerDoc.exists()) {
        const ownerData = ownerDoc.data();
  
        // Verificar si expdate es un Timestamp y convertirlo a Date
        const expdate = ownerData.expdate && ownerData.expdate.toDate ? ownerData.expdate.toDate() : new Date(ownerData.expdate);
        const today = new Date();
  
        console.log('Fecha de expiración:', expdate); // Para verificar si la fecha es correcta
        console.log('Fecha actual:', today);
  
        // Verificar si la fecha actual es mayor que la fecha de expiración
        if (today > expdate) {
          setError("Tu cuenta ha vencido. Por favor, contacta a soporte para renovarla.");
          console.log('Usuario Vencido')
          await signOut(auth);  // Cerrar la sesión si el usuario está vencido
          return;
        }else {
          console.log('Usuario vigente')
        }
  
        // Si el usuario está vigente, proceder con la navegación
        onClose();
        setTimeout(() => {
          const dashboardUrl = `/dashboard/${encodeURIComponent(ownerData.establishmentName.replace(/\s+/g, '-'))}`;
          // navigate(dashboardUrl);  // Descomentar esta línea si estás usando react-router-dom
        }, 100);
      } else {
        onClose();
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

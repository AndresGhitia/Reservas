import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import './RegisterForm.css';

function RegisterForm({ onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [establishmentName, setEstablishmentName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [businessType, setBusinessType] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [accountType, setAccountType] = useState('user'); // Estado para el tipo de cuenta

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (accountType === 'user') {
        await setDoc(doc(db, 'users', user.uid), {
          firstName,
          lastName,
          email
        });
      } else if (accountType === 'owner') {
        await setDoc(doc(db, 'owners', user.uid), {
          establishmentName,
          ownerName,
          establishmentEmail: email,
          businessType,
          createdAt: new Date()
        });
      }

      // Enviar correo de verificación
      await sendEmailVerification(user);

      // Cerrar sesión después de enviar el correo de verificación
      await signOut(auth);

      // Notificar al usuario que debe verificar su correo
      alert("Registro exitoso. Por favor, verifica tu correo electrónico para activar tu cuenta.");
      onClose();
    } catch (error) {
      setError("Error al registrar el usuario: " + error.message);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2 className='register-title'>Registro</h2>

        <div className="tabs">
          <button
            className={`tab ${accountType === 'user' ? 'active' : ''}`}
            onClick={() => setAccountType('user')}
          >
            Cuenta de Usuario
          </button>
          <button
            className={`tab ${accountType === 'owner' ? 'active' : ''}`}
            onClick={() => setAccountType('owner')}
          >
            Cuenta de Negocio
          </button>
        </div>

        {error && <p className="error">{error}</p>}

        <form onSubmit={handleSubmit}>
          {accountType === 'user' && (
            <>
              <div className="form-group">
                <label>Nombre <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="Nombre"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Apellido <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="Apellido"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Correo Electrónico <span className="required">*</span></label>
                <input
                  type="email"
                  placeholder="Correo Electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          {accountType === 'owner' && (
            <>
              <div className="form-group">
                <label>Nombre del Establecimiento <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="Nombre del Establecimiento"
                  value={establishmentName}
                  onChange={(e) => setEstablishmentName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nombre del Propietario <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="Nombre del Propietario"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Correo Electrónico del Establecimiento <span className="required">*</span></label>
                <input
                  type="email"
                  placeholder="Correo Electrónico del Establecimiento"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Rubro <span className="required">*</span></label>
                <input
                  type="text"
                  placeholder="Rubro"
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div className="form-group password-group">
            <label>Contraseña <span className="required">*</span></label>
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

          <button type="submit">Registrarse</button>
        </form>
      </div>
    </div>
  );
}

export default RegisterForm;

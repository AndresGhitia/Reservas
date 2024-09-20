import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
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
  const [businessType, setBusinessType] = useState([]); // Array para almacenar múltiples rubros
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [accountType, setAccountType] = useState('user');

  const availableBusinessTypes = ['Football', 'Paddle', 'Tenis', 'Hockey', 'Volley', 'Handball']; // Opciones de rubros

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Enviar correo de verificación
      await sendEmailVerification(user);

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
          businessType, // Se guarda el array de rubros
          createdAt: new Date()
        });
      }

      alert("Usuario registrado con éxito. Por favor, revisa tu correo electrónico para verificar tu cuenta.");
      onClose();
    } catch (error) {
      console.error("Firebase Error:", error);
      setError("Error al registrar el usuario: " + error.message);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleBusinessTypeChange = (e) => {
    const selectedType = e.target.value;
    if (!businessType.includes(selectedType)) {
      setBusinessType([...businessType, selectedType]); // Agrega el rubro seleccionado
    }
  };

  const removeBusinessType = (type) => {
    setBusinessType(businessType.filter((item) => item !== type)); // Remover rubro seleccionado
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h2 className='register-title'> Registro</h2>

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
                <label>Email <span className="required">*</span></label>
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
                <select onChange={handleBusinessTypeChange}>
                  <option value="">Selecciona un rubro</option>
                  {availableBusinessTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                <div className="selected-business-types">
                  {businessType.map((type) => (
                    <span key={type} className="business-type">
                      {type} <button type="button" onClick={() => removeBusinessType(type)}>✖</button>
                    </span>
                  ))}
                </div>
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

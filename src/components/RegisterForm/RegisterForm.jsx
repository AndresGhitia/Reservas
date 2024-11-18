import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth, db } from '../../firebase'; 
import { doc, setDoc, Timestamp, query, collection, where, getDocs } from 'firebase/firestore';
import OwnerForm from './OwnerForm'; 
import UserForm from './UserForm'; 
import './RegisterForm.css';

function RegisterForm({ onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [establishmentName, setEstablishmentName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [businessType, setBusinessType] = useState([]);
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  const [accountType, setAccountType] = useState('user');
  const [whatsapp, setWhatsapp] = useState('');
  const availableBusinessTypes = ['Football', 'Paddle', 'Tenis', 'Hockey', 'Volley', 'Handball'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Verificar si el negocio ya existe
      if (accountType === 'owner') {
        const ownersRef = collection(db, 'owners');
        const q = query(ownersRef, where('establishmentName', '==', establishmentName));
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
          // Si el negocio ya existe, lanzamos un error
          setError(`Ya existe un negocio registrado con el nombre "${establishmentName}". Por favor, elige otro nombre.`);
          return; // Salimos del flujo de registro
        }
      }
  
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Enviar correo de verificación
      await sendEmailVerification(user);
  
      // Calculate expiration date (3 months from now)
      const createdAt = new Date();
      const expirationDate = new Date();
      expirationDate.setMonth(expirationDate.getMonth() + 3);
  
      // Convert dates to Firebase Timestamp
      const createdAtTimestamp = Timestamp.fromDate(createdAt);
      const expdateTimestamp = Timestamp.fromDate(expirationDate);
  
      if (accountType === 'user') {
        await setDoc(doc(db, 'users', user.uid), {
          firstName,
          lastName,
          email,
        });
      } else if (accountType === 'owner') {
        await setDoc(doc(db, 'owners', user.uid), {
          establishmentName,
          ownerName,
          establishmentEmail: email,
          whatsapp,
          businessType,
          address,
          createdAt: createdAtTimestamp,
          expdate: expdateTimestamp,
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
            <UserForm 
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              email={email}
              setEmail={setEmail}
            />
          )}

          {accountType === 'owner' && (
            <OwnerForm 
              establishmentName={establishmentName}
              setEstablishmentName={setEstablishmentName}
              ownerName={ownerName}
              setOwnerName={setOwnerName}
              email={email}
              setEmail={setEmail}
              whatsapp={whatsapp}
              setWhatsapp={setWhatsapp}
              address={address}
              setAddress={setAddress}
              businessType={businessType}
              setBusinessType={setBusinessType}
              availableBusinessTypes={availableBusinessTypes}
            />
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
            <span 
                  className="toggle-password"
                  onClick={togglePasswordVisibility}>
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
